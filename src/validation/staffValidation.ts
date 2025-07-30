import { StaffBasicType } from "../types/staff-type";
import { phoneRules } from "../data/phoneRulesData";
interface ValidationResult {
  isValid: boolean;
  errors: string;
}

export function staffFormValidation(data: StaffBasicType): ValidationResult {

  let errors=""

  // Validate name
  if (!data.name.trim()) {
    return {
      isValid: false,
      errors: "Name is required."
    }
  }
  if (data.name.trim().length < 3) {
    return {
      isValid: false,
      errors: "Name is not in required format."
    }
  }

  // Validate phone code
  if (!data.phoneCode.trim()) {
    return {
      isValid: false,
      errors: "Phone code is required."
    };
  }


  const rule = phoneRules[data.phoneCode];
  if (!data.phoneNumber.trim()) {
    return { isValid: false, errors: "Phone number is required." };
  } else if (rule && !rule.test(data.phoneNumber)) {
    return {
      isValid: false,
      errors: `Invalid phone number for country code ${data.phoneCode}.`
    };
  }

  // Validate password
  if (!data.password.trim()) {
    return {
      isValid: false,
      errors: "Password is required."
    };  
  } else if (data.password.length < 6) {
    return {
      isValid: false,
      errors: "Password must be at least 6 characters."
    };
  }

  // Validate designation
  if (!data.designation.trim()) {
    return {
      isValid: false,
      errors: "Designation is required."
    };
  }

  // Validate email (optional)
  if (data?.email && !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(data?.email)) {
    return {
      isValid: false,
      errors: "Invalid email address."
    };
  }

  // Validate profilePic (optional)
  if (data?.profilePic && !(data?.profilePic instanceof File)) {
    return {
      isValid: false,
      errors: "Invalid file format for profile picture."
    };
  }

  // Validate accessibleUsers (optional)
  if (data?.accessibleUsers && !Array.isArray(data?.accessibleUsers)) {
    return {
      isValid: false,
      errors: "Accessible users must be an array of numbers."
    };
  }

  // Validate openingBalance (optional)
  if (
    data?.openingBalance !== undefined &&
    (typeof data?.openingBalance !== "number" || isNaN(data?.openingBalance))
  ) {
    return {
      isValid: false,
      errors: "Opening balance must be a valid number."
    };
  }

  return {
    isValid: true,
    errors,
  };
}
