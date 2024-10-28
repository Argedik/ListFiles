"use client";

import { useState } from "react";
import styles from "./index.module.scss";

export default function Home() {
    const [directoryPath, setDirectoryPath] = useState("");
    const [excludeList, setExcludeList] = useState<string[]>([]);
    const [languageExcludes, setLanguageExcludes] = useState<string[]>([]);
    const [additionalExcludes, setAdditionalExcludes] = useState<string[]>([]);

    const languages = ["JavaScript", "Rust", "C#", "Diesel"];
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

    const handleLanguageChange = (language: string) => {
        setSelectedLanguages((prev) =>
            prev.includes(language)
                ? prev.filter((lang) => lang !== language)
                : [...prev, language]
        );
    };

    const handleGenerate = async () => {
        const response = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                directoryPath,
                selectedLanguages,
                additionalExcludes,
            }),
        });

        const data = await response.json();

        if (data.success) {
            alert("Files generated successfully.");
        } else {
            alert("Error generating files.");
        }
    };

    return (
        <div className={styles.container}>
            <h1>File List Generator</h1>
            <div className={styles.form}>
                <label className={styles.label}>
                    Directory Path:
                    <input
                        type="text"
                        value={directoryPath}
                        onChange={(e) => setDirectoryPath(e.target.value)}
                    />
                </label>

                <fieldset className={styles.fieldset}>
                    <legend>Select Languages to Exclude Files/Folders:</legend>
                    {languages.map((lang) => (
                        <label key={lang}>
                            <input
                                type="checkbox"
                                value={lang}
                                checked={selectedLanguages.includes(lang)}
                                onChange={() => handleLanguageChange(lang)}
                            />
                            {lang}
                        </label>
                    ))}
                </fieldset>

                <label>
                    Additional Files/Folders to Exclude (comma-separated):
                    <input
                        type="text"
                        value={additionalExcludes.join(", ")}
                        onChange={(e) =>
                            setAdditionalExcludes(
                                e.target.value
                                    .split(",")
                                    .map((item) => item.trim())
                            )
                        }
                        className={styles.input}
                    />
                </label>

                <button onClick={handleGenerate} className={styles.button}>
                    Generate
                </button>
            </div>
        </div>
    );
}
