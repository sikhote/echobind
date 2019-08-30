import React, { useEffect, useReducer } from "react";
import {
  StyleSheet,
  Text,
  ScrollView,
  TextInput,
  Button,
  FlatList,
  View
} from "react-native";
import axios from "axios";

export const initialState = {
  repos: undefined,
  username: "",
  password: "",
  getError: "",
  noteIndex: undefined,
  note: "",
  postError: ""
};

export const reducer = (state, action) => {
  switch (action.type) {
    case "update": {
      const { field, value } = action.payload;
      return { ...state, [field]: value };
    }
    default:
      throw new Error();
  }
};

export default function App() {
  const [store, dispatch] = useReducer(reducer, initialState);
  const {
    username,
    password,
    repos,
    getError,
    postError,
    note,
    noteIndex
  } = store;
  const getRepos = () =>
    axios
      .get("https://api.github.com/user/repos", {
        auth: { username, password }
      })
      .then(res =>
        dispatch({
          type: "update",
          payload: { field: "repos", value: res.data }
        })
      )
      .catch(() =>
        dispatch({
          type: "update",
          payload: {
            field: "getError",
            value: "There was an error gettings repos."
          }
        })
      );
  const closeNote = () => {
    dispatch({
      type: "update",
      payload: { field: "noteIndex", value: undefined }
    });
  };
  const postNote = note =>
    // axios.post("http://some-endpoint", { note })
    Promise.reject()
      // Promise.resolve()
      .then(() => {
        closeNote();
        dispatch({
          type: "update",
          payload: { field: "note", value: "" }
        });
      })
      .catch(() =>
        dispatch({
          type: "update",
          payload: {
            field: "postError",
            value: "There was an error posting note."
          }
        })
      );

  return (
    <View style={styles.container}>
      {noteIndex !== undefined && (
        <ScrollView style={styles.noteEditor}>
          <Text>Edit note for {repos[noteIndex].name}</Text>
          <View style={styles.spacer} />
          <TextInput
            placeholder="Note"
            style={styles.input}
            onChangeText={value =>
              dispatch({
                type: "update",
                payload: { field: "note", value }
              })
            }
            value={note}
          />
          <View style={styles.spacer} />
          {!!postError && (
            <Button
              onPress={closeNote}
              onSubmitEditing={closeNote}
              title="Close"
              color="#ff0000"
              accessibilityLabel="CloseClose"
            />
          )}
          {!postError && (
            <Button
              onPress={postNote}
              onSubmitEditing={postNote}
              title="Submit Note and Close"
              color="#841584"
              accessibilityLabel="Submit Note and Close"
            />
          )}
          {!!postError && <Text>{postError}</Text>}
        </ScrollView>
      )}
      <ScrollView style={styles.repos}>
        <Text>Github Login</Text>
        <View style={styles.spacer} />
        <TextInput
          autoCapitalize="none"
          placeholder="Username"
          style={styles.input}
          onChangeText={value =>
            dispatch({ type: "update", payload: { field: "username", value } })
          }
          value={username}
        />
        <View style={styles.spacer} />
        <TextInput
          secureTextEntry
          autoCapitalize="none"
          placeholder="Password"
          style={styles.input}
          onChangeText={value =>
            dispatch({ type: "update", payload: { field: "password", value } })
          }
          value={password}
        />
        <View style={styles.spacer} />
        <Button
          onPress={getRepos}
          onSubmitEditing={getRepos}
          title="Login and Output Repos"
          color="#841584"
          accessibilityLabel="Login"
        />
        {!!getError && <Text>{getError}</Text>}
        <View style={styles.spacer} />
        {repos && repos.length < 1 && <Text>No repos to display.</Text>}
        {repos && repos.length > 1 && (
          <FlatList
            renderItem={({ item, index }) => (
              <Text
                onPress={() =>
                  dispatch({
                    type: "update",
                    payload: { field: "noteIndex", value: index }
                  })
                }
              >
                {item.name}
              </Text>
            )}
            data={repos}
            keyExtractor={item => `${item.id}`}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%"
  },
  repos: {
    backgroundColor: "#fff",
    paddingHorizontal: 40,
    paddingVertical: 100
  },
  input: {
    borderWidth: 1,
    width: 200,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  spacer: {
    height: 20,
    width: "100%"
  },
  noteEditor: {
    position: "absolute",
    zIndex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "rgb(200, 200, 200)",
    paddingHorizontal: 40,
    paddingVertical: 100
  }
});
