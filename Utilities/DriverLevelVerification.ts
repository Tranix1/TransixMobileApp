export const getDriverLevel = ({
    nationalIdUrl,
    driverLicenseUrl,
    proofOfResidenceUrl,
    medicalCertificateUrl,
    passportUrl,
    internationalPermitUrl,
}: any) => {
    if (!nationalIdUrl || !driverLicenseUrl) return "Unverified Driver";

    const hasBasic = nationalIdUrl && driverLicenseUrl;

    const hasEnhanced = hasBasic && proofOfResidenceUrl;
    const hasProfessional = hasBasic && medicalCertificateUrl;

    const hasCrossBorder =
        hasBasic && passportUrl && internationalPermitUrl;

    if (hasCrossBorder) return "Cross-Border Verified Driver";
    if (hasProfessional) return "Professional Verified Driver";
    if (hasEnhanced) return "Enhanced Verified Driver";
    if (hasBasic) return "Basic Verified Driver";

    return "Unverified Driver";
};