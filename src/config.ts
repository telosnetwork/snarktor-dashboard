export const config = {
    // ------ Data generator ------
    // Template for generating unique IDs
    uuidTemplate: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    // Variable that determines if we should use a random data generator or base it on real data obtained from https://snarktor-dev.telos.net/metrics
    useGeneratedData: false,

    // ------ Data fetcher ------
    // API URL that provides the data
    dataUrl: 'https://snarktor-dev.telos.net/metrics',

    // ------ Tree Layout ------
    treeMargin: { top: 50, right: 0, bottom: 50, left: 0 },
    // limits for calculating best node radius
    radiusLimits: { max: 16, min: 4, maxLeafs: 100, minLeafs: 32 },
    // set leavesUpwards true if you want the leaves to be at the top of the tree
    leavesUpwards: false,
    // How many rows per section
    rows: 1,
    // Text offsets
    text_h_offset: 40,
    text_v_offset: -10,

    // ------ Received Layout ------
    // received offsets
    received: { h_offset: 40, v_offset: 45, h_spacing: 40, v_spacing: 0 },
    // Truncate the proof_uuid to this length
    truncateId: 5,
}
