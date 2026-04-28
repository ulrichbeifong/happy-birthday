import { useState } from "react";
import { quizData } from "../../data/quizData";
import Button from "../ui/Button";

export default function BirthdayQuiz() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const score = quizData.reduce((total, question) => {
    return total + (answers[question.id] === question.correctIndex ? 1 : 0);
  }, 0);

  const level =
    score === quizData.length
      ? "Bạn thân cấp độ S 💖"
      : score >= Math.ceil(quizData.length / 2)
        ? "Bạn khá hiểu chủ nhân đó nha ✨"
        : "Cần đi chơi với nhau nhiều hơn rồi 😆";

  return (
    <section className="section-card">
      <div className="section-heading">
        <div>
          <h2>Quiz vui</h2>
          <p>Trò chơi nhỏ: Bạn hiểu chủ nhân đến đâu?</p>
        </div>
      </div>

      <div className="quiz-list">
        {quizData.map((question, qIndex) => (
          <article className="quiz-card" key={question.id}>
            <h3>
              Câu {qIndex + 1}: {question.question}
            </h3>

            <div className="quiz-options">
              {question.options.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  className={answers[question.id] === index ? "selected" : ""}
                  onClick={() =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: index
                    }))
                  }
                  disabled={submitted}
                >
                  {option}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="quiz-result">
        {!submitted ? (
          <Button onClick={() => setSubmitted(true)}>
            Xem kết quả
          </Button>
        ) : (
          <div className="glass-card">
            <h3>Kết quả: {score}/{quizData.length}</h3>
            <p>{level}</p>
            <Button
              variant="secondary"
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
            >
              Làm lại
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
