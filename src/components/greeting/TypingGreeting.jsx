import useTypingEffect from "../../hooks/useTypingEffect";

export default function TypingGreeting({ text }) {
  const displayText = useTypingEffect(text, 65);

  return (
    <h1 className="typing-title">
      {displayText}
      <span className="typing-caret" />
    </h1>
  );
}
