"use client";

import styles from "./index.module.scss";

import { useState } from "react";

export default function Home() {
    const [files, setFiles] = useState<FileList | null>(null);

    const handleSubmit = async () => {
        if (files) {
            const formData = new FormData();
            Array.from(files).forEach((file) => {
                // webkitRelativePath özelliğini kullanarak dosyanın göreli yolunu alıyoruz
                formData.append(
                    "files",
                    file,
                    (file as any).webkitRelativePath
                );
            });

            const response = await fetch("/api/deneme", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert("Dosyalar başarıyla yüklendi.");
            } else {
                alert("Dosyalar yüklenirken bir hata oluştu.");
            }
        } else {
            alert("Lütfen bir klasör seçin.");
        }
    };

    return (
        <div>
            <h1>Klasör Seç ve Yükle</h1>
            <label>
                <input
                    type="file"
                    webkitdirectory={true}
                    multiple
                    onChange={(e) => setFiles(e.target.files)}
                />
            </label>
            <button onClick={handleSubmit}>Yükle</button>
        </div>
    );
}
