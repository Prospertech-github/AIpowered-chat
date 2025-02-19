import React, { useEffect, useState } from "react";
import styles from "./chat.module.css";
import { Logo } from "../../assets";
import { Link } from "react-router-dom";

const languages = [
  {
    name: "English",
    value: "en",
  },
  {
    name: "Portuguese",
    value: "pt",
  },
  {
    name: "Turkish",
    value: "tr",
  },
  {
    name: "French",
    value: "fr",
  },
  {
    name: "Spanish",
    value: "es",
  },
  {
    name: "Russian",
    value: "ru",
  },
];

const Chat = () => {
  const [message, setMessage] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");
  const [aidetectedLanguage, setAiDetectedLanguage] = useState(null);
  const [detector, setDetector] = useState(null);
  const [translatedLanguage, setTranslatedLanguage] = useState("");

  function displayMessage(e) {
    e.preventDefault();
    setSubmittedMessage(message);
  }

  useEffect(() => {
    async function checkLanguageDetectorAI() {
      const languageDetectorCapabilities =
        await self.ai.languageDetector.capabilities();
      const canDetect = languageDetectorCapabilities.capabilities;
      let detectorInstance;

      if (canDetect === "no") {
        return;
      }

      if (canDetect === "readily") {
        // The language detector can immediately be used.
        detectorInstance = await self.ai.languageDetector.create();
      } else {
        // The language detector can be used after model download.
        detectorInstance = await self.ai.languageDetector.create({
          monitor(m) {
            m.addEventListener("downloadprogress", (e) => {
              console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
            });
          },
        });
        await detectorInstance.ready;
      }
      setDetector(detectorInstance);
    }
    checkLanguageDetectorAI()
    
  }, []);

  useEffect(() => {
    async function detectMessageLanguage() {
      if (!detector || !submittedMessage) return;

      try {
        const results = await detector.detect(submittedMessage);
        console.log(results);

        const highestConfidence = results.reduce(
          (max, result) => (result.confidence > max.confidence ? result : max),
          results[0]
        );

        const { detectedLanguage, confidence } = highestConfidence;

        console.log(
          `This is ${(confidence * 100).toFixed(1)}% of ${detectedLanguage}`
        );
        console.log(`${languageTagToHumanReadable(detectedLanguage, "en")}`);

        setAiDetectedLanguage({
          detectedLanguage,
          languageValue: languageTagToHumanReadable(detectedLanguage, "en"),
          confidence: (confidence * 100).toFixed(1),
        });
      } catch (error) {
        console.log(error);
      }
    }
    detectMessageLanguage();
  }, [submittedMessage, detector]);

  useEffect(() => {
    async function translateLanguage() {
      // Create a translator that translates from English to French.
      const translator = await self.ai.translator.create({
        sourceLanguage: "en",
        targetLanguage: "fr",
      });
    }
    translateLanguage()
  }, []);

  const languageTagToHumanReadable = (languageTag, targetLanguage) => {
    const displayNames = new Intl.DisplayNames([targetLanguage], {
      type: "language",
    });
    return displayNames.of(languageTag);
  };

  return (
    <div>
      <header className={styles.header}>
        <img src={Logo} alt="Cognichat Logo" />
        <Link to="/"> Back to Home</Link>
      </header>

      <main>
        <div className={styles.inputArea}>
          <form onSubmit={displayMessage}>
            <textarea
              name="message"
              id="message"
              placeholder="Enter your message here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <button type="submit"> Send </button>
          </form>

          <div className={styles.displayArea}>
            <p className={styles.submittedMessage}> {submittedMessage} </p>
            {aidetectedLanguage && (
              <p className={styles.languageDetect}>
                This is {aidetectedLanguage.confidence}% of{" "}
                {aidetectedLanguage.languageValue}
              </p>
            )}

            {submittedMessage && (
              <div className={styles.translateArea}>
                <p>Translate to: </p>
                <select
                  name="translatedLanguage"
                  value={translatedLanguage}
                  onChange={(e) => setTranslatedLanguage(e.target.value)}
                >
                  {languages.map((language) => (
                    <option value={language.value} key={language.value}>{language.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export { Chat };
