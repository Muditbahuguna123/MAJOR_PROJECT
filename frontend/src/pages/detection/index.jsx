import React, { useState, useRef } from "react";
import styles from "./style.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

// Register plugins to avoid SSR issues
if (typeof window !== "undefined") {
    gsap.registerPlugin(useGSAP, SplitText);
}

export default function DetectionPage() {
    const container = useRef();
    const headerRef = useRef();

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // GSAP Animations
    useGSAP(() => {
        // Elegant typographic reveal for the header
        const split = new SplitText(headerRef.current, { type: "words, chars" });

        const tl = gsap.timeline();

        tl.from(split.chars, {
            opacity: 0,
            y: 40,
            rotationX: -90,
            transformOrigin: "0% 50% -50",
            stagger: 0.02,
            duration: 1.2,
            ease: "power4.out"
        })
            .from(".fade-up", {
                opacity: 0,
                y: 30,
                stagger: 0.15,
                duration: 1,
                ease: "power3.out"
            }, "-=0.8");

    }, { scope: container });

    // Handle file selection and generate a preview
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setResult(null); // Reset previous results
        }
    };

    // Submit to Flask Backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);

        const formData = new FormData();
        formData.append("image", file); // 'image' must match the key your Flask app expects

        try {
            // Replace with your actual Flask endpoint
            const response = await fetch("http://localhost:5000/predict", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("Error analyzing image:", error);
            setResult({ error: "Failed to analyze the plant. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.main} ref={container}>
            <div className={styles.wrapper}>
                <h1 ref={headerRef} className={styles.title}>
                    Plant Diagnostics.
                </h1>
                <p className={`${styles.subtitle} fade-up`}>
                    Upload a clear image of a plant leaf to identify potential diseases instantly.
                </p>

                <form onSubmit={handleSubmit} className={`${styles.form} fade-up`}>
                    <div className={styles.uploadZone}>
                        <input
                            type="file"
                            id="plantImage"
                            accept="image/*"
                            onChange={handleFileChange}
                            className={styles.fileInput}
                        />
                        <label htmlFor="plantImage" className={styles.fileLabel}>
                            {preview ? (
                                <img src={preview} alt="Plant Preview" className={styles.previewImage} />
                            ) : (
                                <div className={styles.placeholder}>
                                    <span className={styles.uploadIcon}>+</span>
                                    <span>Select or drop an image</span>
                                </div>
                            )}
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={!file || loading}
                        className={styles.submitBtn}
                    >
                        {loading ? "Analyzing..." : "Detect Disease"}
                    </button>
                </form>

                {/* Results Section */}
                {result && (
                    <div className={`${styles.resultCard} fade-up`}>
                        {result.error ? (
                            <p className={styles.errorText}>{result.error}</p>
                        ) : (
                            <>
                                <h3 className={styles.resultTitle}>Analysis Complete</h3>
                                <div className={styles.resultDetails}>
                                    <p><strong>Condition:</strong> {result.disease_name}</p>
                                    <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%</p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}