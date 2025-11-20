import { ContactHero } from '@/components/contact/ContactHero'
import { ContactCards } from '@/components/contact/ContactCards'
import { ContactForm } from '@/components/contact/ContactForm'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Premium Hero Header */}
      <ContactHero />

      {/* Contact Method Cards */}
      <ContactCards />

      {/* Contact Form */}
      <ContactForm />
    </div>
  )
}
