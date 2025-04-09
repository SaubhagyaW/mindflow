"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, RefreshCw, Check, X } from "lucide-react"
import { generateStrongPassword } from "@/lib/password-utils"

// Password requirements
const passwordRequirements = [
  { id: "length", label: "At least 8 characters", regex: /.{8,}/ },
  { id: "lowercase", label: "At least one lowercase letter", regex: /[a-z]/ },
  { id: "uppercase", label: "At least one uppercase letter", regex: /[A-Z]/ },
  { id: "number", label: "At least one number", regex: /[0-9]/ },
  { id: "special", label: "At least one special character", regex: /[^A-Za-z0-9]/ },
]

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const watchedPassword = form.watch("password")

  // Check which password requirements are met
  const passwordRequirementsMet = passwordRequirements.map((req) => ({
    ...req,
    isMet: req.regex.test(watchedPassword),
  }))

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Register the user (exclude confirmPassword)
      const { confirmPassword, ...registerData } = values
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
        cache: "no-store", // Next.js 15 explicit no caching
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      })

      // Redirect to check email page
      router.push("/check-email")
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Something went wrong.",
        description: error instanceof Error ? error.message : "Your sign up request failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestPassword = () => {
    const strongPassword = generateStrongPassword()

    // Set values in the form
    form.setValue("password", strongPassword)
    form.setValue("confirmPassword", strongPassword)

    // Trigger validation
    form.trigger("password")
    form.trigger("confirmPassword")

    // Show the password temporarily
    setShowPassword(true)
    setShowConfirmPassword(true)

    // Focus on the password field to help browser detect the password change
    if (passwordInputRef.current) {
      passwordInputRef.current.focus()

      // Simulate user interaction by triggering input events
      const inputEvent = new Event("input", { bubbles: true })
      passwordInputRef.current.dispatchEvent(inputEvent)

      // Then focus on confirm password to complete the pattern browsers look for
      setTimeout(() => {
        if (confirmPasswordInputRef.current) {
          confirmPasswordInputRef.current.focus()
          confirmPasswordInputRef.current.dispatchEvent(inputEvent)
        }
      }, 100)
    }

    // Hide passwords after a short delay
    setTimeout(() => {
      setShowPassword(false)
      setShowConfirmPassword(false)
    }, 3000)
  }

  // This effect helps trigger browser password save dialogs
  useEffect(() => {
    // Add autocomplete attributes to help password managers
    const passwordInput = passwordInputRef.current
    const confirmPasswordInput = confirmPasswordInputRef.current

    if (passwordInput && confirmPasswordInput) {
      passwordInput.setAttribute("autocomplete", "new-password")
      confirmPasswordInput.setAttribute("autocomplete", "new-password")
    }
  }, [])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        // Add these attributes to help password managers
        autoComplete="on"
        id="signup-form"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} autoComplete="name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@example.com" {...field} autoComplete="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Password</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-blue-600 hover:text-blue-700"
                  onClick={handleSuggestPassword}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Suggest Strong Password
                </Button>
              </div>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                    className="pr-10"
                    autoComplete="new-password"
                    ref={passwordInputRef}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <div className="mt-2 space-y-2">
                <p className="text-xs font-medium text-gray-700">Password requirements:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {passwordRequirementsMet.map((req) => (
                    <div
                      key={req.id}
                      className={`flex items-center text-xs ${req.isMet ? "text-green-600" : "text-gray-500"}`}
                    >
                      {req.isMet ? (
                        <Check className="h-3 w-3 mr-1 flex-shrink-0" />
                      ) : (
                        <X className="h-3 w-3 mr-1 flex-shrink-0" />
                      )}
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                    className="pr-10"
                    autoComplete="new-password"
                    ref={confirmPasswordInputRef}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="text-sm text-gray-500 mb-4">
          <p>By signing up, you agree to our Terms of Service and Privacy Policy.</p>
          <p className="mt-1">A verification email will be sent to your email address.</p>
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign up"}
        </Button>
      </form>
    </Form>
  )
}

