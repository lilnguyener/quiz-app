import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ButtonGroup } from '@rneui/themed';

const Stack = createNativeStackNavigator();

const QUESTIONS = [
  {
    prompt: 'Matcha originated from China.',
    type: 'true-false',
    choices: ['True', 'False'],
    correct: 0,
  },
  {
    prompt: 'Who is ZEROBASEONE?',
    type: 'multiple-choice',
    choices: ['A KPOP boy group', 'A cleaning company', 'Nobody'],
    correct: 0,
  },
  {
    prompt: 'Which of the following are drinks? Select all that apply.',
    type: 'multiple-answer',
    choices: ['Matcha latte', 'Diet soda', 'Water', 'Mud'],
    correct: [0, 1, 2],
  },
];

const C = {
  bg: '#fdf6f0',
  card: '#fff9f6',
  matcha: '#7aab7a',
  matchaDark: '#4e7a4e',
  matchaLight: '#c8e6c8',
  strawberry: '#e8637a',
  strawberryLight: '#fcd5da',
  strawberryDark: '#c2415a',
  text: '#3a2a2a',
  muted: '#9e8080',
  border: '#f0dada',
  white: '#ffffff',
};

function ChoiceList({ choices, selectedIndices, onPress }) {
  return (
    <View testID="choices" style={choiceStyles.container}>
      {choices.map((choice, i) => {
        const isSelected = selectedIndices.includes(i);
        return (
          <TouchableOpacity
            key={i}
            onPress={() => onPress(i)}
            style={[choiceStyles.button, isSelected && choiceStyles.buttonSelected]}
          >
            <Text style={[choiceStyles.text, isSelected && choiceStyles.textSelected]}>
              {choice}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const choiceStyles = StyleSheet.create({
  container: {
    marginBottom: 24,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#f0dada',
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0dada',
  },
  buttonSelected: {
    backgroundColor: '#c8e6c8',
  },
  text: {
    color: '#3a2a2a',
    fontSize: 15,
    fontWeight: '500',
  },
  textSelected: {
    color: '#4e7a4e',
    fontWeight: '700',
  },
});

export function Question({ navigation, route }) {
  const { data, index, userAnswers } = route.params;
  const question = data[index];
  const isMultiAnswer = question.type === 'multiple-answer';

  const [selectedIndices, setSelectedIndices] = useState([]);

  const handlePress = (i) => {
    if (isMultiAnswer) {
      setSelectedIndices((prev) =>
        prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
      );
    } else {
      setSelectedIndices([i]);
    }
  };

  const canProceed = selectedIndices.length > 0;

  const handleNext = () => {
    const answer = isMultiAnswer
      ? [...selectedIndices].sort()
      : selectedIndices[0];
    const updatedAnswers = [...userAnswers, answer];

    if (index + 1 < data.length) {
      navigation.push('Question', {
        data,
        index: index + 1,
        userAnswers: updatedAnswers,
      });
    } else {
      navigation.navigate('Summary', { data, userAnswers: updatedAnswers });
    }
  };

  const typeBadge =
    question.type === 'true-false'
      ? 'True / False'
      : question.type === 'multiple-choice'
      ? 'Multiple Choice'
      : 'Multiple Answer';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{typeBadge}</Text>
        </View>

        <View style={styles.promptCard}>
          <Text style={styles.prompt}>{question.prompt}</Text>
          {isMultiAnswer && (
            <Text style={styles.hint}>Select all that apply</Text>
          )}
        </View>

        <ChoiceList
          choices={question.choices}
          selectedIndices={selectedIndices}
          onPress={handlePress}
        />

        <TouchableOpacity
          testID="next-question"
          style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canProceed}
        >
          <Text style={[styles.nextButtonText, !canProceed && styles.nextButtonTextDisabled]}>
            {index + 1 === data.length ? 'See Results' : 'Next Question'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export function Summary({ route }) {
  const { data, userAnswers } = route.params;

  const score = data.reduce((acc, question, i) => {
    const correct = question.correct;
    const userAnswer = userAnswers[i];
    const isArray = Array.isArray(correct);
    const gotIt = isArray
      ? JSON.stringify([...correct].sort()) === JSON.stringify([...userAnswer].sort())
      : correct === userAnswer;
    return acc + (gotIt ? 1 : 0);
  }, 0);

  const msg =
    score === data.length
      ? 'Perfect Score!'
      : score >= data.length / 2
      ? 'Nice Work!'
      : 'Keep trying!';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreMsg}>{msg}</Text>
          <Text testID="total" style={styles.scoreNum}>
            {score} / {data.length}
          </Text>
          <Text style={styles.scoreLabel}>correct answers</Text>
        </View>

        {data.map((question, qi) => {
          const correct = question.correct;
          const userAnswer = userAnswers[qi];
          const isArray = Array.isArray(correct);
          const gotIt = isArray
            ? JSON.stringify([...correct].sort()) === JSON.stringify([...userAnswer].sort())
            : correct === userAnswer;
          const correctArr = isArray ? correct : [correct];
          const userArr = isArray ? userAnswer : [userAnswer];

          return (
            <View
              key={qi}
              style={[styles.summaryCard, gotIt ? styles.cardCorrect : styles.cardIncorrect]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardQNum}>Question {qi + 1}</Text>
                <View style={gotIt ? styles.pillCorrect : styles.pillWrong}>
                  <Text style={gotIt ? styles.pillTextCorrect : styles.pillTextWrong}>
                    {gotIt ? '✓ Correct' : '✗ Incorrect'}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardPrompt}>{question.prompt}</Text>

              {question.choices.map((choice, ci) => {
                const isCorrectChoice = correctArr.includes(ci);
                const wasSelected = userArr.includes(ci);

                let rowStyle = styles.choiceNeutral;
                let textStyle = styles.choiceTextNeutral;
                let strike = false;
                let bold = false;

                if (isCorrectChoice && wasSelected) {
                  rowStyle = styles.choiceCorrectChosen;
                  textStyle = styles.choiceTextCorrect;
                  bold = true;
                } else if (isCorrectChoice && !wasSelected) {
                  rowStyle = styles.choiceCorrectMissed;
                  textStyle = styles.choiceTextCorrectMissed;
                } else if (!isCorrectChoice && wasSelected) {
                  rowStyle = styles.choiceWrongChosen;
                  textStyle = styles.choiceTextWrong;
                  strike = true;
                }

                return (
                  <View key={ci} style={[styles.choiceRow, rowStyle]}>
                    <Text
                      style={[
                        styles.choiceLabel,
                        textStyle,
                        strike && styles.strikethrough,
                        bold && styles.bold,
                      ]}
                    >
                      {isCorrectChoice ? '● ' : '○ '}
                      {choice}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.homeScreen}>
        <Text style={styles.homeTitle}>Lily's Quiz</Text>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() =>
            navigation.navigate('Question', {
              data: QUESTIONS,
              index: 0,
              userAnswers: [],
            })
          }
        >
          <Text style={styles.startButtonText}>Start Quiz</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: C.strawberryLight },
          headerTintColor: C.strawberryDark,
          headerTitleStyle: { fontWeight: '700', color: C.strawberryDark },
          headerShadowVisible: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Lily's Quiz App" }} />
        <Stack.Screen
          name="Question"
          component={Question}
          options={({ route }) => ({
            title: `Question ${route.params.index + 1} of ${route.params.data.length}`,
            headerBackVisible: false,
          })}
        />
        <Stack.Screen
          name="Summary"
          component={Summary}
          options={{ title: 'Results', headerBackVisible: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  screen: { padding: 20, paddingBottom: 48 },

  homeScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: C.bg,
  },
  homeTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: C.strawberry,
    letterSpacing: 0.5,
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: C.strawberry,
    paddingHorizontal: 44,
    paddingVertical: 16,
    borderRadius: 30,
  },
  startButtonText: { color: C.white, fontSize: 17, fontWeight: '700' },

  badge: {
    alignSelf: 'flex-start',
    backgroundColor: C.strawberryLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  badgeText: { color: C.strawberryDark, fontSize: 12, fontWeight: '700' },

  promptCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  prompt: { color: C.text, fontSize: 18, fontWeight: '600', lineHeight: 28 },
  hint: { color: C.matcha, fontSize: 13, marginTop: 8, fontWeight: '500' },

  nextButton: {
    backgroundColor: C.matcha,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: { backgroundColor: C.matchaLight },
  nextButtonText: { color: C.white, fontSize: 16, fontWeight: '700' },
  nextButtonTextDisabled: { color: C.matcha },

  scoreCard: {
    backgroundColor: C.strawberryLight,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  scoreMsg: {
    color: C.strawberryDark,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  scoreNum: { color: C.strawberry, fontSize: 56, fontWeight: '800', lineHeight: 64 },
  scoreLabel: { color: C.muted, fontSize: 13, marginTop: 2 },

  summaryCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardCorrect: { borderLeftColor: C.matcha },
  cardIncorrect: { borderLeftColor: C.strawberry },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardQNum: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pillCorrect: {
    backgroundColor: C.matchaLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pillWrong: {
    backgroundColor: C.strawberryLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pillTextCorrect: { color: C.matchaDark, fontSize: 11, fontWeight: '700' },
  pillTextWrong: { color: C.strawberryDark, fontSize: 11, fontWeight: '700' },
  cardPrompt: { color: C.text, fontSize: 14, fontWeight: '500', marginBottom: 12, lineHeight: 21 },

  choiceRow: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, marginBottom: 3 },
  choiceNeutral: { backgroundColor: 'transparent' },
  choiceCorrectChosen: { backgroundColor: 'rgba(122,171,122,0.15)' },
  choiceCorrectMissed: { backgroundColor: 'rgba(122,171,122,0.07)' },
  choiceWrongChosen: { backgroundColor: 'rgba(232,99,122,0.1)' },
  choiceLabel: { fontSize: 14 },
  choiceTextNeutral: { color: C.muted },
  choiceTextCorrect: { color: C.matchaDark },
  choiceTextCorrectMissed: { color: 'rgba(78,122,78,0.5)' },
  choiceTextWrong: { color: C.strawberry },
  strikethrough: { textDecorationLine: 'line-through' },
  bold: { fontWeight: '800' },
});