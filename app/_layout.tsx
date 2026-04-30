import {SplashScreen, Stack} from "expo-router";
import '@/global.css';
import {useFonts} from "expo-font";
import {useEffect} from "react";
export default function RootLayout() {
  const [fontsloaded]=useFonts({
    'sans-regular':require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold':require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium':require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold':require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-light':require('../assets/fonts/PlusJakartaSans-Light.ttf'),
    'sans-extrabold':require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf')

  })

  //we are using the useFonts hook from expo fonts, we pass to it an object where keys are
  //names of font we wanna use and the values are actual font files
  //it returns a boolean variable that tells whether the fonts have finished loading or not
  //the useEfect watches for that boolean and once the fonts are loaded, it calls the
  //SplashScreen.hide to reveal the app

  useEffect(()=>{
    if(fontsloaded){
      SplashScreen.hideAsync()
    }
  },[fontsloaded]) // re-trigger whenever the fontsloaded changes

  if(!fontsloaded){
    return null;
  } //but until then, this little check prevents the app from loading

  return <Stack screenOptions={{headerShown:false}} />;
}
