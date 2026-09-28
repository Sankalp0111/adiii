import { useEffect, useMemo, useState } from 'react';

const seededCredentials = {
  email: 'aditiullas123@gmail.com',
  password: 'SankalpAditi@290103',
};

const defaultForm = { email: seededCredentials.email, password: seededCredentials.password };

const mazeLayout = [
  '###################',
  '#S..#...#.........#',
  '###.#.#.#.#######.#',
  '#...#.#...#.....#.#',
  '#.###.#####.###.###',
  '#.#.....#.....#...#',
  '#.#.###.#.#######.#',
  '#.#.#.#.....#...#.#',
  '#.#.#.#######.#.#.#',
  '#.#.....#.....#.#.#',
  '#.#####.#.#####.#.#',
  '#...#...#.#...#...#',
  '###.#.###.#.#.###.#',
  '#...#...#.#.#...#.#',
  '#.#######.#.###.#.#',
  '#.#.......#...#...#',
  '#.#.#########.#####',
  '#...#............G#',
  '###################',
];

function App() {
  const [email, setEmail] = useState(defaultForm.email);
  const [password, setPassword] = useState(defaultForm.password);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [game, setGame] = useState('memory');
  const [memoryCards, setMemoryCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matches, setMatches] = useState(0);
  const [guess, setGuess] = useState('');
  const [randomMessage, setRandomMessage] = useState('');
  const [introStage, setIntroStage] = useState('intro');
  const [lights, setLights] = useState([false, false, false, false, false]);
  const [bulbStages, setBulbStages] = useState([0, 0, 0, 0, 0]);
  const [bulbReady, setBulbReady] = useState([false, false, false, false, false]);
  const [bulbPrompt, setBulbPrompt] = useState(null);
  const [bulbInput, setBulbInput] = useState('');
  const [levelOneComplete, setLevelOneComplete] = useState(false);
  const [levelTwoStarted, setLevelTwoStarted] = useState(false);
  const [levelTwoComplete, setLevelTwoComplete] = useState(false);
  const [giftOpened, setGiftOpened] = useState(false);
  const [thirdGameStarted, setThirdGameStarted] = useState(false);
  const [doorCode] = useState('130124');
  const [doorInput, setDoorInput] = useState('');
  const [doorUnlocked, setDoorUnlocked] = useState(false);
  const [clueIndex, setClueIndex] = useState(0);
  const [clueInput, setClueInput] = useState('');
  const [memoryCode, setMemoryCode] = useState({ month: '', day: '', year: '' });
  const [fourthGameStarted, setFourthGameStarted] = useState(false);
  const [fourthGameComplete, setFourthGameComplete] = useState(false);
  const [lastGameStarted, setLastGameStarted] = useState(false);
  const [lastGameFinished, setLastGameFinished] = useState(false);
  const [litCandles, setLitCandles] = useState([]);
  const [candlePrompt, setCandlePrompt] = useState('Follow the light, one candle at a time.');
  const [playerPos, setPlayerPos] = useState({ row: 1, col: 1 });
  const [foundHearts, setFoundHearts] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile?email=' + encodeURIComponent(email));
        const data = await response.json();
        if (data.ok) setProfile(data.user);
      } catch (_err) {
        // silent fail; ignored during first render
      }
    };

    if (email) fetchProfile();
  }, [email]);

  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const response = await fetch('/api/gifts');
        const data = await response.json();
        if (data.ok) setGifts(data.gifts);
      } catch (_err) {
        // silent fail; ignored on first render
      }
    };

    fetchGifts();
  }, []);

  useEffect(() => {
    initializeMemory();
  }, []);

  const initializeMemory = () => {
    const symbols = ['💖', '🌷', '✨', '🎀', '🍓', '💫'];
    const deck = [...symbols, ...symbols]
      .map((symbol, index) => ({ id: `${symbol}-${index}`, symbol, matched: false }))
      .sort(() => Math.random() - 0.5);

    setMemoryCards(deck);
    setFlipped([]);
    setMatches(0);
  };

  useEffect(() => {
    if (flipped.length !== 2) return;

    const [first, second] = flipped;
    if (memoryCards[first]?.symbol === memoryCards[second]?.symbol) {
      setMemoryCards((current) =>
        current.map((card, index) =>
          flipped.includes(index) ? { ...card, matched: true } : card
        )
      );
      setMatches((current) => current + 1);
      setFlipped([]);
      return;
    }

    const timeout = setTimeout(() => setFlipped([]), 850);
    return () => clearTimeout(timeout);
  }, [flipped, memoryCards]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      setUser(data.user);
      setProfile({ email: data.user.email, full_name: data.user.fullName, birthday_message: 'Happy Birthday, my love! Every second with you feels special.' });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const messages = useMemo(
    () => [
      'You are my favorite person, my peace, and my forever.',
      'You make my life softer, sweeter, and so much more beautiful.',
      'Every birthday with you is a gift I never want to take for granted.',
      'I love your smile, your laughter, and the way you make everything feel brighter.'
    ],
    []
  );

  const hiddenHeartReasons = useMemo(
    () => [
      { id: 'smile', x: 8, y: 16, reason: 'I love your smile because it makes every bad day feel lighter 😍✨' },
      { id: 'kindness', x: 22, y: 28, reason: 'I love how kind and soft your heart is toward everyone you care about... except me 😜😹💖' },
      { id: 'laughter', x: 50, y: 18, reason: 'I love your laughter because it turns ordinary moments into beautiful memories 💕😂' },
      { id: 'dreams', x: 72, y: 35, reason: 'I love how you dream big and make me believe in beautiful futures with you 🌙✨' },
      { id: 'peace', x: 58, y: 68, reason: 'I love how being with you feels like peace, comfort, and home all at once 🫶🌷' },
      { id: 'love', x: 82, y: 72, reason: 'I love you for the way you make my heart feel full, warm, and safe forever 💞💌' }
    ],
    []
  );

  const memoryClues = useMemo(
    () => [
      {
        prompt: 'What will be sanku\'s future company name?',
        answer: ['sankalp and sons'],
        field: 'month',
      },
      {
        prompt: 'What was the day of the date we first locked into this story?',
        answer: ['thursday'],
        field: 'day',
      },
      {
        prompt: 'What year did this beautiful chapter begin?',
        answer: ['2025'],
        field: 'year',
      },
    ],
    []
  );

  const revealQuote = () => {
    const selected = messages[Math.floor(Math.random() * messages.length)];
    setRandomMessage(selected);
  };

  const revealHeart = (heartId) => {
    if (foundHearts.includes(heartId)) return;

    const selectedHeart = hiddenHeartReasons.find((heart) => heart.id === heartId);
    setFoundHearts((current) => [...current, heartId]);
    setRandomMessage(selectedHeart ? selectedHeart.reason : 'A tiny heart revealed a reason I love you 💖✨');
  };

  const submitMemoryClue = () => {
    if (!memoryClues[clueIndex]) return;

    const currentClue = memoryClues[clueIndex];
    const normalizedInput = clueInput.trim().toLowerCase();
    const acceptedAnswers = Array.isArray(currentClue.answer) ? currentClue.answer : [currentClue.answer];
    const isCorrect = acceptedAnswers.some((answer) => normalizedInput === answer.toLowerCase());

    if (!isCorrect) {
      setRandomMessage('Not quite. Try to remember the little details we shared 💕');
      return;
    }

    setMemoryCode((current) => ({
      ...current,
      [currentClue.field]: acceptedAnswers[0],
    }));

    if (clueIndex === memoryClues.length - 1) {
      setRandomMessage('The memory clicks into place. Now enter the full safe code 💌');
      setClueInput('');
      setClueIndex(memoryClues.length);
      return;
    }

    setClueInput('');
    setClueIndex((current) => current + 1);
    setRandomMessage('Nice memory. One more clue left 💖');
  };

  const movePlayer = (deltaRow, deltaCol) => {
    setPlayerPos((current) => {
      const nextRow = current.row + deltaRow;
      const nextCol = current.col + deltaCol;
      const nextTile = mazeLayout[nextRow]?.[nextCol];

      if (!nextTile || nextTile === '#') return current;

      const nextPos = { row: nextRow, col: nextCol };
      if (nextTile === 'G') {
        setFourthGameComplete(true);
      }
      return nextPos;
    });
  };

  const candleWords = useMemo(
    () => ['Forever', "isn't", 'long', 'enough', 'with', 'you'],
    []
  );

  const playBirthdaySong = () => {
    if (typeof window === 'undefined') return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const audioContext = new AudioCtx();
    const notes = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.66, 349.23, 392.0, 523.25, 587.33, 523.25];

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency;
      gainNode.gain.value = 0.0001;
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const start = audioContext.currentTime + index * 0.22;
      const duration = 0.18;

      oscillator.start(start);
      gainNode.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.stop(start + duration + 0.05);
    });

    setTimeout(() => audioContext.close(), 2200);
  };

  const handleCandleTap = (index) => {
    if (litCandles.includes(index) || lastGameFinished) return;

    if (index !== litCandles.length) {
      setCandlePrompt('Almost there — keep following the light.');
      return;
    }

    const nextLitCandles = [...litCandles, index];
    setLitCandles(nextLitCandles);

    if (nextLitCandles.length === candleWords.length) {
      setLastGameFinished(true);
      setCandlePrompt('Forever isn\'t long enough with you');
      playBirthdaySong();
      return;
    }

    setCandlePrompt(`The next word is waiting...`);
  };

  const handleMemoryClick = (index) => {
    if (flipped.length === 2 || memoryCards[index].matched || flipped.includes(index)) return;
    setFlipped((current) => [...current, index]);
  };

  const handleGuess = () => {
    if (!guess.trim()) return;
    if (guess.trim().toLowerCase() === 'aditi') {
      setRandomMessage('Correct! You know her best.');
    } else {
      setRandomMessage('Not quite, but your heart is in the right place 💕');
    }
    setGuess('');
  };

  const allMatched = memoryCards.length > 0 && memoryCards.every((card) => card.matched);

  useEffect(() => {
    if (lights.every(Boolean) && !levelOneComplete) {
      setLevelOneComplete(true);
      setRandomMessage('You have successfully completed the game! Please open your gift 💌');
    }
  }, [lights, levelOneComplete]);

  const handleLightToggle = (index) => {
    if (bulbStages[index] === 2) return;

    if (bulbStages[index] === 1) {
      if (bulbReady[index]) {
        setBulbStages((current) => current.map((stage, idx) => (idx === index ? 2 : stage)));
        setLights((current) => current.map((light, idx) => (idx === index ? true : light)));
        setBulbReady((current) => current.map((ready, idx) => (idx === index ? false : ready)));
        setRandomMessage('Nice! This bulb is glowing.');
        setBulbPrompt(null);
        setBulbInput('');
        return;
      }

      setBulbStages((current) => current.map((stage, idx) => (idx === index ? 2 : stage)));
      setLights((current) => current.map((light, idx) => (idx === index ? true : light)));
      setRandomMessage('Nice! This bulb is glowing.');
      setBulbPrompt(null);
      setBulbInput('');
      return;
    }

    const bulbQuestions = {
      0: { question: 'Add adjective ____ bartan', answer: ['khali'] },
      1: { question: 'Three character name', answer: ['akp'] },
      2: { question: "What's your nickname Sankalp uses often?", answer: ['kutti'] },
      3: { question: "What's your current emergency count?", answer: ['39'] },
      4: { question: "What is adiii's classic resume called (hint is ____road resume)?", answer: ['mithaghar', 'mithagar'] },
    };

    const prompt = bulbQuestions[index];
    if (prompt) {
      setBulbPrompt({ index, question: prompt.question, answer: prompt.answer });
      setBulbStages((current) => current.map((stage, idx) => (idx === index ? 1 : stage)));
      setBulbInput('');
      setRandomMessage('Wait! Try the next bulb.');
      return;
    }

    setBulbStages((current) => current.map((stage, idx) => (idx === index ? 1 : stage)));
    setRandomMessage('Wait! Try the next bulb.');
  };

  const submitLightAnswer = () => {
    if (!bulbPrompt) return;

    const acceptedAnswers = Array.isArray(bulbPrompt.answer) ? bulbPrompt.answer : [bulbPrompt.answer];
    const normalizedAnswer = bulbInput.trim().toLowerCase();
    const isCorrect = acceptedAnswers.some((answer) => normalizedAnswer === answer.toLowerCase());

    if (isCorrect) {
      setBulbReady((current) => current.map((ready, idx) => (idx === bulbPrompt.index ? true : ready)));
      setRandomMessage('Correct! Press the bulb again and it will light up.');
      setBulbPrompt(null);
      setBulbInput('');
      return;
    }

    setRandomMessage('Not quite. Try again.');
  };

  const resetLights = () => {
    setLights([false, false, false, false, false]);
    setBulbStages([0, 0, 0, 0, 0]);
    setBulbReady([false, false, false, false, false]);
    setBulbPrompt(null);
    setBulbInput('');
    setRandomMessage('');
  };

  useEffect(() => {
    if (levelTwoStarted && foundHearts.length === hiddenHeartReasons.length) {
      setRandomMessage('');
    }
  }, [foundHearts, hiddenHeartReasons.length, levelTwoStarted]);

  if (!user) {
    return (
      <div className="page-shell login-shell">
        <div className="floating-hearts" aria-hidden="true">
          <span>💖</span>
          <span>✨</span>
          <span>🎀</span>
          <span>🌷</span>
          <span>💫</span>
        </div>

        <div className="login-card intro-card">
          {introStage === 'intro' ? (
            <>
              <p className="eyebrow">23rd Birthday Quest</p>
              <h1>Happy 23rd Birthday, Adiiiiiii! 🎉</h1>
              <p className="intro-copy">
                For my favorite girl, my softest laughter, and my sweetest forever — this little birthday adventure is made just for you. 💖✨
              </p>

              <div className="birthday-badges" aria-label="Celebration icons">
                <span>🎂</span>
                <span>🎉</span>
                <span>✨</span>
                <span>🎈</span>
                <span>💖</span>
              </div>

              <div className="game-tiles">
                <div className="game-tile">
                  <span>✨</span>
                  <strong>Sweet Memories</strong>
                </div>
                <div className="game-tile">
                  <span>💖</span>
                  <strong>Love Notes</strong>
                </div>
                <div className="game-tile">
                  <span>🎁</span>
                  <strong>Gift Quest</strong>
                </div>
              </div>

              <button type="button" onClick={() => setIntroStage('login')}>
                Start the birthday adventure
              </button>
            </>
          ) : (
            <>
              <p className="eyebrow">Private birthday access</p>
              <h1>Welcome, love</h1>
              <form onSubmit={handleLogin}>
                <label>
                  Email
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>
                  Password
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                {error && <div className="error-box">{error}</div>}
                <button type="submit" disabled={isLoggingIn}>{isLoggingIn ? 'Checking...' : 'Enter surprise'}</button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  if (user && !levelOneComplete) {
    return (
      <div className="page-shell level-shell">
        <div className="card level-card">
          <p className="eyebrow">Level 1</p>
          <h2>Turn on the lights</h2>
          <p className="level-copy">Light every bulb to unlock the surprise.</p>

          <div className="light-grid">
            {lights.map((isOn, index) => (
              <button
                key={index}
                type="button"
                className={`light-bulb ${isOn ? 'on' : 'off'}`}
                onClick={() => handleLightToggle(index)}
                aria-label={isOn ? 'Turn off light' : 'Turn on light'}
              >
                {isOn ? '💡' : '🔦'}
              </button>
            ))}
          </div>

          {bulbPrompt && (
            <div className="riddle-box">
              <p className="riddle-question">{bulbPrompt.question}</p>
              <input
                type="text"
                value={bulbInput}
                onChange={(e) => setBulbInput(e.target.value)}
                placeholder="Type your answer"
              />
              <button type="button" onClick={submitLightAnswer}>Submit answer</button>
            </div>
          )}

          {randomMessage && <div className="quote-box success-box">{randomMessage}</div>}
          {lights.every(Boolean) && (
            <button type="button" onClick={() => setLevelTwoStarted(true)} className="next-level-btn">
              Start Level 2
            </button>
          )}
        </div>
      </div>
    );
  }

  if (user && levelOneComplete && !levelTwoStarted) {
    return (
      <div className="page-shell level-shell">
        <div className="card level-card transition-card">
          <p className="eyebrow">Level 1 cleared</p>
          <h2>Mission complete! 🎉</h2>
          <p className="level-copy">
            {randomMessage || 'You have successfully completed the game! Please open your gift 💌'}
          </p>

          <div className="letter-box">
            <p>Dear adiii 💖</p>
            <p>
              It has been more than 17 months since you and me became we. 💫 I have enjoyed each and every moment that I have spent with you, and I cherish every smile, every conversation, and every memory we have made together. 🌷
            </p>
            <p>
              Let us wait for now, because you still have to play more games to unlock the premium awards. 🏆 All the best, babie 💕 I hope you will clear the next level, and I will see you there. ✨
            </p>
          </div>

          <button type="button" onClick={() => setLevelTwoStarted(true)}>
            Start Level 2
          </button>
        </div>
      </div>
    );
  }

  if (user && levelOneComplete && levelTwoStarted && !levelTwoComplete) {
    return (
      <div className="page-shell level-shell">
        <div className="card level-card heart-hunt-card">
          <p className="eyebrow">Level 2</p>
          <h2>Hidden hearts hunt 💖</h2>
          <p className="level-copy">Find every tiny heart hidden around the page. Each one reveals a reason I love you.</p>

          <div className="heart-hunt-area">
            {hiddenHeartReasons.map((heart) => {
              const isFound = foundHearts.includes(heart.id);
              return (
                <button
                  key={heart.id}
                  type="button"
                  className={`heart-token ${isFound ? 'found' : ''}`}
                  style={{ left: `${heart.x}%`, top: `${heart.y}%` }}
                  onClick={() => revealHeart(heart.id)}
                  aria-label={isFound ? 'Heart found' : 'Hidden heart'}
                >
                  {isFound ? '❤' : '♥'}
                </button>
              );
            })}
          </div>

          <div className="love-reasons-panel">
            {hiddenHeartReasons.map((heart) => {
              const isFound = foundHearts.includes(heart.id);
              return (
                <div key={heart.id} className={`love-reason ${isFound ? 'revealed' : ''}`}>
                  {isFound ? heart.reason : '???'}
                </div>
              );
            })}
          </div>

          {randomMessage && <div className="quote-box success-box">{randomMessage}</div>}

          {foundHearts.length === hiddenHeartReasons.length && (
            <div className="button-row level-actions">
              <button
                type="button"
                onClick={() => {
                  setLevelTwoComplete(true);
                  setGiftOpened(false);
                }}
              >
                Open Gift
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (user && levelTwoComplete && !thirdGameStarted) {
    return (
      <div className="page-shell level-shell">
        <div className="card level-card gift-reveal-card">
          {!giftOpened ? (
            <>
              <p className="eyebrow">Final surprise</p>
              <h2>Your gift is waiting 💌</h2>
              <p className="level-copy">
                You completed the hidden hearts hunt. Open the gift and read the note I saved just for you.
              </p>
              <button type="button" onClick={() => setGiftOpened(true)}>Open Gift</button>
            </>
          ) : (
            <>
              <div className="gift-glow" aria-hidden="true">✨</div>
              <div className="gift-letter" role="article">
                <p className="eyebrow">Dear adiii,</p>
                <p>
                  Congratulations adiii for completing this level. 🥳✨ Since we met back in January last year, I have enjoyed your laughter 💕, your rude behaviour 😹, and the way you love your dudu 🫶. Every moment with you has felt special and unforgettable 💫.
                </p>
                <p>
                  We have gone through so much together 💞, and I am so grateful for all the memories, the smiles 😊, and the little things that made us stronger 💪. I am sorry babie for my recent behaviour 😔. I will not behave in that way again, baby 💖. I am learning and trying to be better for you every day 🌷.
                </p>
                <p>
                  I have enjoyed all the time we were together, even while walking in Churchgate and talking for hours 🫣. Please forgive me every time I make a mistake because of my adamant behaviour 🙇‍♂️. I love you so much, baby, more than words can say 💌. You mean the world to me 🌍💖.
                </p>
                <p>
                  Thank you for being my peace, my comfort, and my happiness 🫶✨. I hope we keep making beautiful memories together and grow even closer with every passing day 💞. See you in the next game 🙂💖. All the best, my love. ✨
                </p>
              </div>

              <button
                type="button"
                className="next-level-btn"
                onClick={() => {
                  setThirdGameStarted(true);
                  setRandomMessage('The 3rd game is waiting for you, my love 💖');
                }}
              >
                Let&apos;s move to 3rd game
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (user && thirdGameStarted && !doorUnlocked) {
    const codeReady = Boolean(memoryCode.month && memoryCode.day && memoryCode.year);

    return (
      <div className="page-shell level-shell">
        <div className="card level-card lock-card">
          <p className="eyebrow">Level 3</p>
          <h2>Memory Lock 🔒</h2>
          <p className="level-copy">
            The code is hidden in our memories. Remember the future company name, the day, and the year when our story began.
          </p>
          <div className="hint-box">
            <p>Hint: the unlock key code is given below. Read the question carefully and avoid using the synonym of distance from the keyboard.</p>
          </div>

          {!codeReady && clueIndex < memoryClues.length && (
            <div className="lock-box">
              <p className="riddle-question">{memoryClues[clueIndex].prompt}</p>
              <input
                type="text"
                value={clueInput}
                onChange={(e) => setClueInput(e.target.value)}
                placeholder="Type your answer"
              />
              <div className="button-row level-actions">
                <button type="button" onClick={submitMemoryClue}>Check memory</button>
              </div>
            </div>
          )}

          {codeReady && clueIndex >= memoryClues.length && (
            <div className="lock-box">
              <div className="memory-code-preview">
                <span>{memoryCode.month || 'month'}</span>
                <span>{memoryCode.day || 'day'}</span>
                <span>{memoryCode.year || 'year'}</span>
              </div>

              <input
                type="text"
                value={doorInput}
                onChange={(e) => setDoorInput(e.target.value)}
                placeholder="Type the full code"
              />

              <div className="button-row level-actions">
                <button type="button" className="secondary" onClick={() => setDoorInput('')}>Clear</button>
                <button
                  type="button"
                  onClick={() => {
                    const finalCode = `${memoryCode.month}${memoryCode.day}${memoryCode.year}`.toLowerCase();
                    if (doorInput.trim().toLowerCase() === finalCode) {
                      setDoorUnlocked(true);
                      setRandomMessage('Correct! The lock clicks open and your final message is waiting 💌');
                    } else {
                      setRandomMessage('Not quite... try again, love. The memory is still there 💕');
                    }
                  }}
                >
                  Unlock
                </button>
              </div>
            </div>
          )}

          {randomMessage && <div className="quote-box success-box">{randomMessage}</div>}
        </div>
      </div>
    );
  }

  if (user && doorUnlocked && !fourthGameStarted) {
    return (
      <div className="page-shell level-shell">
        <div className="card level-card lock-card final-message-card">
          <p className="eyebrow">Final message</p>
          <h2>Unlocked 💫</h2>
          <div className="final-lock-message">
            <p>Dear Adiii ❤️</p>
            <p>
              I still remember the day I said something about Batman, and you completely lost it laughing 🦇😂. Honestly, I still don't know if I was right or wrong, but I remember exactly how you laughed. That's the part that stayed with me. 🥹💛
            </p>
            <p>
              Then there's achan, who took one look at you and decided "Aditi" wasn't enough — you had to be "Aditi kutti penne" 🐕. That's the funniest name I've ever come across. Dada renamed you AKP, and it's my favorite abbreviation 😂.
            </p>
            <p>
              I think about the day you tried to teach me photography 📸. You were patient with me even though I was clearly hopeless at it 🥹. Honestly, I still can't take a decent picture, but when you're standing next to me, I just want to click as many pictures as I can with you 🥰📷.
            </p>
            <p>
              And your math 🧮😂 — damn, god, what should I even say about it 😅. I will never rely on your calculations, it's simply too dangerous 😂🚨 (I love you, but please, let me handle the bill). 😏💖
            </p>
            <p>
              There was our little Mini SO and Mulund's Happy Home trip 🥹🛍️ — walking around together, buying toys and gifts, and it was special. And the cake you baked with your own hands 🥹🎂✨ — it was perfectly made by you for me and that made it better than anything from a bakery 🥹🫂💋.
            </p>
            <p>
              Then there's the peanut incident 🥜😂. You found out the hard way that peanuts and your stomach don't get along, and now I enjoy watching you regret every bite 😂😂 . I can't even look at peanuts without thinking of you. 😹
            </p>
            <p>
              And "bonbon" 🍪😂 — it's Bourbon, Adiii. Just Bourbon. I've corrected you more times than I can count🫣😂, and you still say it your way, so at some point, I gave up 🙄 and started saying it too 😂.
            </p>
            <p>
              I think about Upvan 🌳 too — how quiet it was, just trees and that golden afternoon ☀️😂, and neither of us really needed to talk. And Band Stand 🌊, walking with music playing somewhere in the background, and your concern for that dancing guy 😠 was truly something special 🙄. I still laugh remembering you holding that live crab like it was absolutely nothing 🦀😂, and yet you cry the moment you see a mouse or even a dog 😹.
            </p>
            <p>
              We watched Narivetta together too 🎬🙈 — not exactly a "making" movie 😉 — but somehow, we made it work 😂. The Korean noodles 🍜🥢 you sent me were absolutely delicious.
            </p>
            <p>
              Apart from these moments we had various other moments that I might have not mentioned 🥹🫂.... But I have enjoyed every time being with you 🥹 . You have made the small, forgettable stuff impossible to forget. 💫✨
            </p>
            <p>
              Happy 23rd birthday, Adiii 🥹🫂💋🎀. I hope you will enjoy your day with your friends and specially dudu 🥹🎀. I hope you will love your dudu's surprise 🥹🫂💋... See you soon babie 🥹🩷
            </p>
            <p>
              I love you so much 🥹💖✨
            </p>
            <p>
              Ummahhhh 🥹💋💋💋💋
            </p>
          </div>
          <button type="button" onClick={() => setFourthGameStarted(true)}>Let&apos;s play fourth game</button>
        </div>
      </div>
    );
  }

  if (user && fourthGameStarted && !fourthGameComplete) {
    return (
      <div className="page-shell level-shell">
        <div className="card level-card maze-card">
          <p className="eyebrow">Level 4</p>
          <h2>Maze of love 🧭</h2>
          <p className="level-copy">Guide your little hero through the maze and reach the gift box at the end.</p>

          <div className="maze-board" role="application" aria-label="Maze game board">
            {mazeLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="maze-row">
                {row.split('').map((cell, colIndex) => {
                  const isPlayer = playerPos.row === rowIndex && playerPos.col === colIndex;
                  const isGoal = cell === 'G';
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`maze-cell ${cell === '#' ? 'wall' : 'path'} ${isGoal ? 'goal' : ''}`}
                    >
                      {isPlayer && <span className="maze-player">🧑‍💻</span>}
                      {isGoal && !isPlayer && <span className="maze-gift">🎁</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="maze-controls">
            <button type="button" onClick={() => movePlayer(-1, 0)}>↑</button>
            <div className="maze-vertical-controls">
              <button type="button" onClick={() => movePlayer(0, -1)}>←</button>
              <button type="button" onClick={() => movePlayer(0, 1)}>→</button>
            </div>
            <button type="button" onClick={() => movePlayer(1, 0)}>↓</button>
          </div>

          <div className="quote-box success-box">
            {playerPos.row === 9 && playerPos.col === 9 ? 'You reached the gift! My love for you is the real prize 💖' : 'Keep going. You are almost there ✨'}
          </div>
        </div>
      </div>
    );
  }

  if (user && fourthGameComplete && !lastGameStarted) {
    return (
      <div className="page-shell level-shell">
        <div className="card level-card lock-card final-message-card">
          <p className="eyebrow">Final note</p>
          <h2>For my favorite person 💖</h2>
          <div className="final-lock-message">
            <p>Dear adiii 💖✨</p>
            <p>Congratulations for finishing this maze, Adiii 🥹💕✨. Life will give us many mazes 💫🧭. Some small, some hard, some really annoying 😅, and I always want to go through all of them with you 🥹❤️.</p>
            <p>I know you will be there for me 💛. Even when things get hard, even when I mess up 😭, I know you will stay and help me fix things, just like you found your way through this maze 🧩💖.</p>
            <p>But I want to be honest about something 💌. Sometimes it hurts that we do not get to meet as often as I want 😔. It is a quiet feeling, but it is there 🌧️. Especially on days I wish I could just see you instead of only texting 💬💞. Please know it is never because I do not want to be with you 😭💖. It is always the distance, busy schedules, and all the things that get in the way 🛤️.</p>
            <p>So if I have ever let you down 😞, if there were days I should have called and did not 📵, or times I should have tried harder 💪, I am sorry🥹. And thank you for forgiving me every time and for staying with me 🥺🌷💛.</p>
            <p>Wishing you many many happy returns of the day, Adiii 🤧🎂💛✨. And all the best for your final game😏 🎉. Go finish this journey the way you finish everything, beautifully 🌸🫣💖.</p>
            <p>I love you 💘💋💖🫂 ummahhh 💋💋💋💋</p>
          </div>
          <button type="button" onClick={() => setLastGameStarted(true)}>play the last game</button>
        </div>
      </div>
    );
  }

  if (user && lastGameStarted) {
    return (
      <div className="page-shell level-shell last-game-shell">
        <div className="card level-card last-game-card">
          <p className="eyebrow">Final game</p>
          <h2>Light the Way ✨</h2>
          <p className="level-copy">Tap each candle in order to light the path and reveal the words that lead to your letter.</p>

          <div className="candle-trail" aria-label="Candle trail game">
            {candleWords.map((word, index) => {
              const isLit = litCandles.includes(index);
              return (
                <button
                  key={`${word}-${index}`}
                  type="button"
                  className={`candle ${isLit ? 'lit' : ''}`}
                  onClick={() => handleCandleTap(index)}
                  aria-label={isLit ? `Lighted candle for ${word}` : `Candle ${index + 1}`}
                >
                  <span className="flame">✦</span>
                  <span className="candle-word">{isLit ? word : '…'}</span>
                </button>
              );
            })}
          </div>

          <div className="sentence-display">
            {candleWords.map((word, index) => (
              <span key={`${word}-${index}`} className={litCandles.includes(index) ? 'word-visible' : 'word-hidden'}>
                {litCandles.includes(index) ? word : '•'}
              </span>
            ))}
          </div>

          <div className="quote-box success-box">{candlePrompt}</div>

          {lastGameFinished && (
            <>
              <div className="cake-celebration" aria-hidden="true">
                <span className="confetti confetti-1">🎉</span>
                <span className="confetti confetti-2">✨</span>
                <span className="confetti confetti-3">🎂</span>
                <div className="birthday-cake">🎂</div>
              </div>

              <div className="lightway-letter" role="article">
                <p>Dear Adiii 🥹🩷,</p>
                <p>
                  Happiest birthday baby 🥹🩷 .... It&apos;s 23rd birthday and I hope you will enjoy your day ....
                </p>
                <p>
                  Happy birthday, my love🥹🫂✨. You are the light in every room, the softness in every hard day, and the reason for making me  feel happy 🥹🩷🎀
                </p>
                <p>
                  I hope this year brings you all the joy you have given me, all the peace you deserve🥹🩷💋, and all the love that you make me feel every single day🥺🫂. Thank you for being you — gentle, strong, funny, unforgettable my lady🥹🩷🫂✨.
                </p>
                <p>
                  You deserve a life filled with laughter, calm, beautiful memories, and endless reasons to smile 🥹🩷🎀. I will always be grateful for you, and I will always choose you, my favorite person and my girl 🥹🫂✨.
                </p>
                <p>
                  Many many happy returns of the day, my love 🥹💋✨. May your life always be full of peace, laughter, love, and beautiful moments that remind you how deeply you are cherished🥹🫂🎀🩷.
                </p>
                <p>
                  Forever isn&apos;t long enough with you baby 🥹✨. I love you so much 🥹🩷🫂.... Ummahhh 🥹💋💋💋💋
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="birthday-title-wrap">
          <p className="eyebrow">23rd Birthday Quest</p>
          <h1 className="birthday-title">Happy 23rd Birthday, Adiiiiiii! 🎉</h1>
        </div>
        <button className="secondary" onClick={() => setUser(null)}>Logout</button>
      </header>

      <main className="content-grid">
        <section className="card hero-card birthday-hero">
          <div className="hero-floaters" aria-hidden="true">
            <span>✨</span>
            <span>🎂</span>
            <span>💖</span>
            <span>🎉</span>
          </div>
          <p className="eyebrow">Birthday Quest Lv. 1</p>
          <h2 className="birthday-subtitle">For the girl who makes life softer, brighter, and more beautiful — happy 23rd birthday, my love. 💖✨</h2>
          <p className="message">{profile?.birthday_message || 'Happy 23rd birthday, my love. You make every day brighter.'}</p>
          <div className="button-row quest-buttons">
            <button onClick={revealQuote}>Reveal love note</button>
            <button className="secondary" onClick={() => setGame('memory')}>🧠 Memory Match</button>
            <button className="secondary" onClick={() => setGame('guess')}>💌 Write a note</button>
            <button className="secondary" onClick={() => setGame('guess')}>🎁 Open the gift</button>
          </div>
          {randomMessage && <div className="quote-box">{randomMessage}</div>}
        </section>

        <section className="card gifts-card">
          <p className="eyebrow">Birthday wishlist</p>
          <div className="gift-grid">
            {gifts.map((gift) => (
              <article key={gift.id} className="gift-item">
                <div className="gift-emoji">{gift.emoji}</div>
                <h3>{gift.name}</h3>
                <p>{gift.description}</p>
                <span>{gift.tag}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="card mini-game-card">
          <p className="eyebrow">Mini game</p>
          {game === 'memory' && (
            <>
              <h3>Memory Match</h3>
              <div className="memory-grid">
                {memoryCards.map((card, index) => {
                  const isVisible = flipped.includes(index) || card.matched;
                  return (
                    <button
                      key={card.id}
                      className={`memory-card ${isVisible ? 'visible' : ''} ${card.matched ? 'matched' : ''}`}
                      onClick={() => handleMemoryClick(index)}
                    >
                      {isVisible ? card.symbol : '?'}
                    </button>
                  );
                })}
              </div>
              {allMatched && <div className="quote-box">You matched them all! You are my star 🩷</div>}
              <button className="secondary" onClick={initializeMemory}>Restart memory</button>
            </>
          )}

          {game === 'guess' && (
            <>
              <h3>Name the birthday girl</h3>
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type your guess"
              />
              <div className="button-row">
                <button onClick={handleGuess}>Submit guess</button>
                <button className="secondary" onClick={() => setRandomMessage('She is the most beautiful person in my world.')}>Hint</button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
