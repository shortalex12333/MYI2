export type CompanyContact = {
  website?: string
  contactUrl?: string
  phone?: string
  email?: string
  address?: string
}

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

const contactsByName: Record<string, CompanyContact> = {
  [norm('Bluewater Yacht Insurance')]: {
    website: 'https://bluewaterins.com/',
    contactUrl: 'https://bluewaterins.com/contact-us/',
    phone: '+1 561-743-3442',
    email: 'don@bluewaterinsurance.com',
    address: '2711 E Mallory Blvd, Jupiter, FL 33458, USA',
  },
  [norm('BOAT International Insurance')]: {
    website: 'https://www.boatinternational.com/',
    contactUrl: 'https://www.boatinternational.com/contact',
    phone: '+44 (0)20 8955 7077',
    email: 'info@boatinternationalmedia.com',
  },
  [norm('Falvey Insurance')]: {
    website: 'https://www.falveyinsurancegroup.com/',
    contactUrl: 'https://falveyinsurancegroup.com/contact/',
    // Public privacy contact available; general inquiries go through contact form
    email: 'DataProtection@FalveyInsuranceGroup.com',
  },
  [norm('Falvey Yacht Insurance')]: {
    website: 'https://www.falveyinsurancegroup.com/',
    contactUrl: 'https://falveyinsurancegroup.com/contact/',
    email: 'DataProtection@FalveyInsuranceGroup.com',
  },
  [norm('Navigators & General')]: {
    website: 'https://www.navandgen.co.uk/',
    contactUrl: 'https://www.navandgen.co.uk/contact-us/',
    phone: '+44 1273 863 400',
    email: 'enquiries@navandgen.co.uk',
    address: 'Navigators & General, C/O Apogee, 6-8 Bonhill Street, London EC2A 4BX, UK',
  },
  [norm('Pantaenius')]: {
    website: 'https://www.pantaenius.com/uk-en/',
    contactUrl: 'https://www.pantaenius.com/uk-en/service/get-in-touch/contact-the-client-hub/',
    phone: '+44 1752 223656',
    email: 'hello@pantaenius.co.uk',
  },
  [norm('Pantaenius Yacht Insurance')]: {
    website: 'https://www.pantaenius.com/uk-en/',
    contactUrl: 'https://www.pantaenius.com/uk-en/service/get-in-touch/contact-the-client-hub/',
    phone: '+44 1752 223656',
    email: 'hello@pantaenius.co.uk',
  },
}

export function getCompanyContact(name?: string): CompanyContact | undefined {
  if (!name) return undefined
  return contactsByName[norm(name)]
}

