import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./Post.module.scss";

export default function Section() {
  const [status, setStatus] = useState("supported");
  const [text, setText] = useState("");
  const [inbox, setInbox] = useState({});

  useEffect(() => {
    navigator.serviceWorker.addEventListener("message", function (event) {
      // A message has been received, now show the message on the page.
      var clientId = event.data.client;
      setInbox((inbox) => ({
        ...inbox,
        // A message from this client hasn’t been received before, so we need to setup a place to show its messages.
        [clientId]: `Client ${clientId} says: ${event.data.message}`,
      }));
    });
  }, []);

  const handleChangeText = useCallback((e) => {
    const { value: text } = e.target;
    setText(text);
  }, []);

  const handleSendMessage = useCallback(() => {
    setText("");
    if (!navigator.serviceWorker.controller) {
      setStatus("error: no controller");
      return;
    }
    // Send the message to the service worker.
    navigator.serviceWorker.controller.postMessage(text);
  }, [text]);

  const handleKeyDown = useCallback(
    (e) =>
      e.key === "Enter" &&
      !e.shiftKey &&
      (e.preventDefault(), handleSendMessage()),
    [handleSendMessage]
  );

  const received = useMemo(() => Object.values(inbox), [inbox]);

  return (
    <section className={styles.Section}>
      <h2>Send</h2>
      <p>
        Open another window with this page and type some text in below to
        postMessage it to the ServiceWorker which will forward the message
        along.
      </p>
      <span id="status">{status}</span>
      <div id="received">
        {received.map((line, key) => (
          <div key={key}>{line}</div>
        ))}
      </div>
      <input
        value={text}
        onChange={handleChangeText}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleSendMessage} disabled={!text.length}>
        send
      </button>
    </section>
  );
}
