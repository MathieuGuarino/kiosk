import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const DynamicForm = () => {
  const [formData, setFormData] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsList, setQuestionsList] = useState([]);
  const [topic, setTopic] = useState("");
  const [subTopic, setSubTopic] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:3001");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        const topicKey = Object.keys(data.root)[0];
        const subTopicKey = Object.keys(data.root[topicKey])[0];

        setTopic(topicKey);
        setSubTopic(subTopicKey);

        const questions = flattenQuestions(data.root[topicKey][subTopicKey]);
        setQuestionsList(questions);
        setCurrentQuestion(questions[0]);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const flattenQuestions = (questions) => {
    return Object.keys(questions).reduce((acc, key) => {
      acc.push({ key: key, value: questions[key] });
      if (
        typeof questions[key] === "object" &&
        Object.keys(questions[key]).length > 0
      ) {
        acc = acc.concat(flattenQuestions(questions[key]));
      }
      return acc;
    }, []);
  };

  const handleChange = (e, key) => {
    setFormData({
      ...formData,
      [key]: e.target.value,
    });
  };

  const handleNext = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questionsList.length) {
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(questionsList[nextIndex]);
    } else {
      console.log("Form Data:", formData);
      alert("Formulaire terminé");
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  const renderQuestion = (question) => {
    const key = question.key;
    return (
      <div key={key}>
        <TextField
          label={key}
          variant="standard"
          onChange={(e) => handleChange(e, key)}
        />
      </div>
    );
  };

  return (
    <div>
      <h1>{topic}</h1>
      <h2>{subTopic}</h2>
      <form>{renderQuestion(currentQuestion)}</form>
      <Button sx={{ mt: 2 }} variant="outlined" onClick={handleNext}>
        Suivant
      </Button>
    </div>
  );
};

export default DynamicForm;
