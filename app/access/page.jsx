"use client"
import { Suspense } from "react"
import AccessContextForm from "./access-context-form"

export default function AccessContextPage() {
  return (
    <Suspense fallback={null}>
      <AccessContextForm />
    </Suspense>
  )
}
