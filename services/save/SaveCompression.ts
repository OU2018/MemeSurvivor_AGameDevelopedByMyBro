
export const SaveCompression = {
    // Binary packing handles compression naturally.
    // These are pass-throughs or basic helpers now.
    compress: (str: string): string => str,
    decompress: (str: string): string => {
        // Legacy support: check if it's URI encoded (contains %)
        if (str.includes('%')) {
             try {
                return decodeURIComponent(atob(str));
             } catch (e) {
                return str;
             }
        }
        return str;
    }
};
