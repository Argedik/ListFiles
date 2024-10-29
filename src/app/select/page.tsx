"use client";

import { useState } from "react";
import styles from "./index.module.scss";

export default function Home() {
    const [directoryPath, setDirectoryPath] = useState<string>("");
    const [excludeList, setExcludeList] = useState<string[]>([]);
    const [languageExcludes, setLanguageExcludes] = useState<string[]>([]);
    const [additionalExcludes, setAdditionalExcludes] = useState<string[]>([]);

    const languages = ["JavaScript", "Rust", "C#", "Diesel"];
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

    const handleLanguageChange = (language: string) => {
        setSelectedLanguages((prev) =>
            prev.includes(language)
                ? prev.filter((lang) => lang !== language)
                : [...prev, " ", language]
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
        if (!response.ok) {
            console.error("İstek başarısız:", response.status);
            return;
        }
        const data = await response.json();

        if (data.success) {
            alert("Dosyalar başarıyla oluşturuldu.");
        } else {
            alert("Dosyalar oluşturulurken bir hata oluştu.");
        }
    };

    return (
        <div className={styles.container}>
            <h1>
                Dosya ve klasör isimlerinizi kodlarıyla beraber oluşturalım!
            </h1>
            <div className={styles.form}>
                {/* Dizin Yolu Girişi */}
                <label>
                    Dizin Yolu:
                    <input
                        type="text"
                        value={directoryPath}
                        onChange={(e) => setDirectoryPath(e.target.value)}
                        placeholder="Dizin yolunu girin (örn: C:\\Users\\enes.gedik\\Desktop\\projem)"
                        className={styles.input}
                    />
                </label>

                {/* Dil Seçimi */}
                <fieldset className={styles.fieldset}>
                    <legend>Hariç Tutmak İstediğiniz Dilleri Seçin:</legend>
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

                {/* Ek Hariç Tutmalar */}
                <label>
                    Hariç Tutulacak Ekstra Dosya/Klasörler (virgülle ayrılmış):
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
