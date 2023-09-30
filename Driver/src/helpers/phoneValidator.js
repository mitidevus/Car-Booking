export function phoneValidator(phone) {
    if (!phone) return "Required"
    if (phone.length != 10) return "Phone number must be 10 digits"
    return ''
  }