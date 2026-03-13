// data.ts - Mock KINGS_DATA since we don't have the full raw content.
// We will mock one or two characters to let the chat feature work!
export const KINGS_DATA: Record<string, any> = {
    "ashoka": {
        id: "ashoka",
        summary: {
            title: "Ashoka the Great",
            reign: "c. 268 – 232 BCE"
        },
        content: "I am Ashoka, the Maurya Emperor who ruled almost all of the Indian subcontinent. After the bloody Kalinga War, I embraced Buddhism and propagated Dhamma.",
        imageUrl: "" // No image URL for now
    },
    "cleopatra": {
        id: "cleopatra",
        summary: {
            title: "Cleopatra VII",
            reign: "51 – 30 BC"
        },
        content: "I am Cleopatra, the last active ruler of the Ptolemaic Kingdom of Egypt. I formed alliances with Julius Caesar and Mark Antony.",
        imageUrl: "" // No image URL for now
    }
};
