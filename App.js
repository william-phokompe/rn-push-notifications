import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";

Notifications.setNotificationHandler({
  handleNotification: async (_) => {
    return {
      shouldShowAlert: true,
    };
  },
});

export default function App() {
  useEffect((_) => {
    Permissions.getAsync(Permissions.NOTIFICATIONS)
      .then((statusObj) => {
        if (statusObj.status !== "granted") {
          return Permissions.askAsync(Permissions.NOTIFICATIONS);
        }
        return statusObj;
      })
      .then((statusObj) => {
        if (statusObj.status !== "granted") {
          throw new Error("Permission denied!");
        }
      })
      .then((_) => {
        console.log("Getting token")
        return Notifications.getExpoPushTokenAsync()
      }).then(res => {
        //https://expo.io/notifications
        const token = res.data
      }).catch(errr => {
        console.log(errr);
        return null;
      });
  }, []);

  useEffect((_) => {
    const backgroundSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    const foregroundSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(notification);
      }); // Allows to define a function that should be executed on an incoming notification when the app is in the foreground

    return (_) => {
      backgroundSubscription.remove();
      foregroundSubscription.remove();
    };
  }, []);

  const triggerNotificationHandler = (_) => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "My first local notification",
        body: "My first local notification that I'm sending",
      },
      trigger: {
        seconds: 10,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Button
        title="Trigger Notification"
        onPress={triggerNotificationHandler}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
