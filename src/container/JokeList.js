/** @format */

import React, { useState, useEffect } from "react";
import axios from "axios";
import Joke from "../components/Joke";
import "./JokeList.css";

// Separate functions for local storage
const getLocalStorage = () => {
  return JSON.parse(localStorage.getItem("jokes")) || [];
};

const setLocalStorage = (arr) => {
  localStorage.setItem("jokes", JSON.stringify(arr));
};

// Function to add new jokes
const addJokes = async (jokes, numJokesToGet) => {
  const j = [...jokes];
  const seenJokes = new Set();

  try {
    while (j.length < numJokesToGet) {
      const res = await axios.get("https://icanhazdadjoke.com", {
        headers: { Accept: "application/json" },
      });
      const { ...jokeObj } = res.data;

      if (!seenJokes.has(jokeObj.id)) {
        seenJokes.add(jokeObj.id);
        j.push({ ...jokeObj, votes: 0, isLocked: false });
      } else {
        console.error("duplicate found!");
      }
    }

    return j;
  } catch (err) {
    console.error(err);
    return jokes; // Return the existing jokes in case of an error
  }
};

// JokeList component
function JokeList({ numJokesToGet = 5 }) {
  const [jokes, setJokes] = useState(getLocalStorage());
  const [isLoading, setIsLoading] = useState(jokes.length < numJokesToGet);

  useEffect(() => {
    setLocalStorage(jokes);
  }, [jokes]);

  useEffect(() => {
    if (jokes.length < numJokesToGet) {
      setIsLoading(true);
      addJokes(jokes, numJokesToGet)
        .then((newJokes) => {
          setJokes(newJokes);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [jokes, numJokesToGet]);

  const toggleLock = (id) => {
    setJokes((prevJokes) =>
      prevJokes.map((joke) =>
        joke.id === id ? { ...joke, isLocked: !joke.isLocked } : joke
      )
    );
    setLocalStorage(jokes); // Update local storage after toggling lock
  };

  const resetVotes = () => {
    const resetJokes = jokes.map((j) => (j.isLocked ? j : { ...j, votes: 0 }));
    setJokes(resetJokes);
    setLocalStorage(resetJokes);
  };

  const generateNewJokes = () => {
    const lockedJokes = jokes.filter((j) => j.isLocked === true);
    setJokes(lockedJokes);
    setIsLoading(true);
  };

  const vote = (id, delta) => {
    setJokes((allJokes) =>
      allJokes.map((j) => (j.id === id ? { ...j, votes: j.votes + delta } : j))
    );
    setLocalStorage(jokes);
  };

  if (isLoading) {
    return (
      <div className="loading">
        <i className="fas fa-4x fa-spinner fa-spin" />
      </div>
    );
  }

  let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);
  const allJokesAreLocked = jokes.every((joke) => joke.isLocked);

  return (
    <div className="JokeList">
      <button
        className="JokeList-getmore"
        onClick={generateNewJokes}
        disabled={allJokesAreLocked}
      >
        Get New Jokes
      </button>
      <button className="JokeList-reset" onClick={resetVotes}>
        Reset Votes
      </button>

      {sortedJokes.map(({ joke, id, votes, isLocked }) => (
        <Joke
          text={joke}
          key={id}
          id={id}
          votes={votes}
          vote={vote}
          isLocked={isLocked}
          toggleLock={() => toggleLock(id)}
        />
      ))}
    </div>
  );
}

export default JokeList;
