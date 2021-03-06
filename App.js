import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
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

  const [pushToken, sePushToken] = useState();
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
        console.log("Getting token");
        return Notifications.getExpoPushTokenAsync();
      })
      .then((res) => {
        //https://expo.io/notifications
        const token = res.data;

        setPushToken(token);
        // Sending a notification to another device
        // get store the token on your own server, i.e:
        // fetch('https://your-own-api.com/api) then use it to send it to that device
      })
      .catch((errr) => {
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

  const triggerExpoNotificationHandler = (_) => {
    fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, defate',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: pushToken,
        data: {extraData: 'SomeData'},
        title: 'Trigger From App',
        body: 'This is a message from expo triggered from app'
      })
    })
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          title="Trigger Notification"
          onPress={triggerNotificationHandler}
        />
      </View>
      <View>
        <Button
          title="Trigger Expo Notification"
          onPress={triggerExpoNotificationHandler}
        />
      </View>
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

  buttonContainer: {
    marginBottom: 10
  },
});
