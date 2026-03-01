import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Colors from "../constants/colors";
import { Fonts } from '../constants/fonts';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found", headerStyle: { backgroundColor: Colors.bg }, headerTintColor: Colors.text }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Return to Dashboard</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.bg,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.light,
    fontWeight: "300",
    color: Colors.text,
    letterSpacing: 0.5,
  },
  link: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: Colors.tealBg,
    borderWidth: 1,
    borderColor: Colors.teal,
  },
  linkText: {
    fontSize: 14,
    color: Colors.teal,
    fontFamily: Fonts.regular,
    fontWeight: "400",
    letterSpacing: 0.5,
  },
});
