import Image from "next/image";
import { Inter } from "next/font/google";
import Form from "@/components/Form";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

const triggerFileDownload = (filename: string, content: string) => {
  const element = document.createElement("a");
  const file = new Blob([content], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
};

export default function Home() {
  const [translatedSrt, setTranslatedSrt] = React.useState("");

  async function handleStream(response: any) {
    const data = response.body;
    if (!data) return;

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let doneReading = false;

    while (!doneReading) {
      const { value, done } = await reader.read();
      doneReading = done;
      const chunk = decoder.decode(value);

      setTranslatedSrt((prev) => prev + chunk);
    }
  }

  async function handleSubmit(content: string, language: string) {
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        body: JSON.stringify({ content, language }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        await handleStream(response);
        const filename = `${language}.srt`;
        triggerFileDownload(filename, translatedSrt);
      } else {
        console.error(
          "Error occurred while submitting the translation request"
        );
      }
    } catch (error) {
      console.error(
        "Error during file reading and translation request:",
        error
      );
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Form onSubmit={handleSubmit} />
      <hr />
      Answer below:
      {translatedSrt}
    </main>
  );
}
