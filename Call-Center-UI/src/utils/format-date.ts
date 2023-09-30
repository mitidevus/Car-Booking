export function formatDate(inputDateString: string): string {
    const date = new Date(inputDateString);

    const outputDateString = date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });

    return outputDateString;
}

export function getRemainingDays(expiryDate: string): string {
    const expiryDateInMilliseconds = new Date(expiryDate).getTime();
    const todayInMilliseconds = new Date().getTime();

    if (expiryDateInMilliseconds < todayInMilliseconds) {
        return "0 day";
    }

    const remainingDays = Math.ceil(
        (expiryDateInMilliseconds - todayInMilliseconds) / (1000 * 60 * 60 * 24)
    );

    return `${remainingDays} day${remainingDays > 1 ? "s" : ""}`;
}

export function getExpiryStatus(expiryDate: string): string {
    const expiryDateInMilliseconds = new Date(expiryDate).getTime();
    const todayInMilliseconds = new Date().getTime();

    if (expiryDateInMilliseconds < todayInMilliseconds) {
        return "Expired";
    }

    return "Active";
}
