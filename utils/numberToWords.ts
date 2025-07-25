// Function to convert a number into Indian currency words
export const numberToWords = (num: number): string => {
    if (num === 0) return 'Zero';

    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const inWords = (n: number): string => {
        let str = '';
        if (n > 19) {
            str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
        } else {
            str += a[n];
        }
        return str;
    };
    
    let n = Math.floor(num);
    let result = '';

    if (n >= 10000000) {
        result += inWords(Math.floor(n / 10000000)) + 'Crore ';
        n %= 10000000;
    }

    if (n >= 100000) {
        result += inWords(Math.floor(n / 100000)) + 'Lakh ';
        n %= 100000;
    }

    if (n >= 1000) {
        result += inWords(Math.floor(n / 1000)) + 'Thousand ';
        n %= 1000;
    }

    if (n >= 100) {
        result += inWords(Math.floor(n / 100)) + 'Hundred ';
        n %= 100;
    }

    if (n > 0) {
        if(result !== '') result += 'and ';
        result += inWords(n);
    }
    
    return result.trim() + ' Only';
};