import moment from 'moment'

export const formatDate = (_date: string | number = '', format?: string) => {
    if (!_date) return '';

    console.log('formatDate input:', _date, 'type:', typeof _date);

    // Handle different date formats
    let createdData;
    if (typeof _date === 'string') {
        // If it's a string, try to parse it as a number first (timestamp)
        if (!isNaN(Number(_date))) {
            createdData = new Date(Number(_date));
        } else {
            createdData = new Date(_date);
        }
    } else {
        createdData = new Date(_date);
    }

    // Check if the date is valid
    if (isNaN(createdData.getTime())) {
        console.log('Invalid date:', _date);
        return 'Invalid date';
    }

    const now = new Date();
    const diffInMs = now.getTime() - createdData.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    console.log('Date calculation:', {
        createdData: createdData.toISOString(),
        now: now.toISOString(),
        diffInMs,
        diffInDays
    });


    // Handle future dates (if createdData is in the future)
    if (diffInMs < 0) {
        return moment(createdData).format(format || 'DD MMM, YYYY');
    }

    // Handle past dates
    if (diffInHours < 24) {
        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
        if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
        return moment(createdData).format(format || 'DD MMM, YYYY');
    }
}

// Alias for formatDate to maintain backward compatibility
export const getDate = formatDate;


export const cleanNumber = (text: string) => {
    if (!text) return '';
    const d = text.split(' ').filter(Boolean).join('')
    const cleaned = d.replace(/\D/g, "");

    if (cleaned.length <= 3) {
        return text;
    } else if (cleaned.length <= 6) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    } else {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`;
    }
};
export const formatNumber = (num: number) => {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B'; // Billions
    }
    if (num >= 1e6) {
        return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'; // Millions
    }
    if (num >= 1e3) {
        return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'; // Thousands
    }
    return num.toString(); // Less than 1000
}

export const formatCurrency = (val: string | number, decimalPlaces: number = 2, currencySymbol: string = '') => {
    const amount = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(amount) || typeof amount !== 'number') return `${currencySymbol}0`;

    return `${currencySymbol}${amount
        .toFixed(decimalPlaces)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

