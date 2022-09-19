/**
 * Given a list of numbers return the smallest unused non-negative integer.
 */
export function getNextUnused(used: number[]) {
    const sorted = used.sort((a, b) => a - b);
    // If there are no credentials or 0 is not used, use 0
    if (!sorted.length || sorted[0] > 0) {
        return 0;
    }
    let i = 0;
    while (i + 1 < sorted.length) {
        // If the next credNumber is not the succesor of the current, there is a hole that can be filled
        if (sorted[i] + 1 < sorted[i + 1]) {
            break;
        }
        i += 1;
    }
    // Use the next credNumber
    return sorted[i] + 1;
}
