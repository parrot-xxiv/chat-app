import LoginForm from "@/components/login-form"

export default function Home() {
  // In a real app, you would check if the user is authenticated
  // If they are, redirect to the chat page
  // For demo purposes, we'll just show the login form

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome to ChatApp</h1>
        <LoginForm />
      </div>
    </main>
  )
}
