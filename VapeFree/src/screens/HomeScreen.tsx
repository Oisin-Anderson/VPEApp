import React, { useState, useEffect, useRef, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, TextInput, Pressable, Alert, FlatList, InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { usePuff } from '../context/PuffContext';
import { Animated } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef, useImperativeHandle } from 'react';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const scale = (size: number) => (SCREEN_WIDTH / 375) * size; // 375 is base width (iPhone X)
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size; // 812 is base height




// Define interfaces for data
interface ChartDataPoint {
  time: string;
  value: number;
}

interface PuffEntry {
  time: string;
  strength: number;
}


const formatTimeComponents = (seconds: number) => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return { days, hours, minutes, seconds: secs };
};


const getRelativeTimeText = (lastPuff: Date | null): string => {
  if (!lastPuff) return 'No puffs yet';
  const now = new Date();
  const diff = Math.floor((now.getTime() - lastPuff.getTime()) / 1000); // in seconds

  if (diff < 60) return 'A few seconds ago';
  if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(diff / 86400);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};


const getDurationText = (seconds: number): string => {
  if (seconds < 60) return 'A few seconds';
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  const days = Math.floor(seconds / 86400);
  return `${days} day${days > 1 ? 's' : ''}`;
};




const HomeScreen = (
  { refreshKey }: { refreshKey: number },
  ref: React.Ref<{ openNicotineModal: () => void }>
) => {
  const { puffCount, setPuffCount, nicotineMg, setNicotineMg } = usePuff();
  const [lifetimePuffs, setLifetimePuffs] = useState(0);
  const [nicotineStrength, setNicotineStrength] = useState('0');
  const isStrengthConfigured = parseFloat(nicotineStrength) > 0;
  const [lifetimeNicotineMg, setLifetimeNicotineMg] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [lastResetDate, setLastResetDate] = useState<string | null>(null);
  const [puffTrigger, setPuffTrigger] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [todayLimit, setTodayLimit] = useState<number | null>(null);
  const [lastPuffTime, setLastPuffTime] = useState<Date | null>(null);
  const [relativeTimeText, setRelativeTimeText] = useState('—');
  const [longestTime, setLongestTime] = useState<number>(0);
  const [showStats, setShowStats] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(1)); // starts fully visible
  const isFocused = useIsFocused();
  const showStatsRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [puffCountLoaded, setPuffCountLoaded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [extendedTips, setExtendedTips] = useState<string[]>([]);
  const [fadeTipAnim] = useState(new Animated.Value(1)); // Starts visible
  const [showEditCountModal, setShowEditCountModal] = useState(false);
  const [editCountValue, setEditCountValue] = useState('');
  const [isPuffButtonDisabled, setIsPuffButtonDisabled] = useState(false);




  const [fadeIn] = useState(new Animated.Value(0));

  useImperativeHandle(ref, () => ({
    openNicotineModal: () => setIsModalVisible(true),
  }));


  useEffect(() => {
    if (puffCountLoaded) {
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [puffCountLoaded]);


  const quitTips: string[] = [
  "Chew gum (especially minty or cinnamon) to keep your mouth busy.",
  "Suck on hard candy or lollipops during cravings.",
  "Eat crunchy snacks like carrots, celery, or nuts to mimic the hand-to-mouth action.",
  "Drink cold water with a straw to keep your hands and mouth busy.",
  "Use toothpicks or flavored toothpicks for oral fixation.",
  "Keep a stress ball or fidget toy nearby to occupy your hands.",
  "Use a lollipop stick (without candy) to simulate holding a vape.",
  "Practice deep breathing exercises whenever you crave.",
  "Use a flavored lip balm to stimulate senses around your mouth.",
  "Brush your teeth when cravings hit – the clean feeling helps deter vaping.",
  "Create a mantra ('I don't need it,' 'This craving will pass') and repeat it.",
  "Visualize your vape cravings like ocean waves—rising and falling, always temporary.",
  "Practice mindfulness meditation to stay present and reduce anxiety.",
  "Remind yourself: the craving only lasts a few minutes.",
  "Keep a journal of your triggers and successes.",
  "List all the reasons you’re quitting and re-read them daily.",
  "Record voice memos of your future self thanking you for quitting.",
  "Join an online support forum or subreddit like r/QuitVaping.",
  "Write down how you feel during a craving—it helps you process and resist.",
  "Celebrate small wins (hour, day, week, etc.).",
  "Remove all vapes, chargers, and juice from your space.",
  "Clean your car, clothes, and room to get rid of vape smell.",
  "Change your routine to avoid vaping triggers.",
  "Avoid places or people that make you want to vape early on.",
  "Spend more time in vape-free environments (museums, libraries, nature).",
  "Keep your hands and mouth busy after meals—a common trigger.",
  "Set up “no-vape zones” in your home or car.",
  "Put a rubber band around your wrist and snap it gently when you crave.",
  "Delete vape-related social media or influencer accounts.",
  "Switch up your commute or breaks if they’re associated with vaping.",
  "Start a light workout routine—even short walks help reduce cravings.",
  "Drink lots of water to flush out nicotine and stay hydrated.",
  "Track how your breathing improves over time.",
  "Join a yoga or fitness class to stay focused and accountable.",
  "Take up stretching or foam rolling during cravings.",
  "Start a challenge (e.g., push-up per craving) to build strength and discipline.",
  "Use a fitness tracker to see your health improve day by day.",
  "Weigh yourself weekly—many notice positive physical changes.",
  "Try running or cycling to feel how much easier it gets post-vape.",
  "Track how long it takes for your taste and smell to return.",
  "Eat small, healthy meals to maintain stable blood sugar.",
  "Avoid caffeine if it triggers cravings.",
  "Add more fruits and vegetables to your diet.",
  "Drink herbal teas (like chamomile or peppermint) to calm yourself.",
  "Avoid alcohol early on—a major vaping trigger for many.",
  "Have healthy snacks available at all times.",
  "Avoid sugary foods that spike and crash your energy.",
  "Chew on sunflower seeds or pumpkin seeds.",
  "Keep a smoothie mix ready to give your hands something to do.",
  "Try spicy foods to engage your taste buds without vaping.",
  "Download a quit vaping app to track progress.",
  "Set phone reminders with motivational quotes or milestones.",
  "Use a countdown or timer app to ride out cravings.",
  "Listen to calming music or white noise when anxious.",
  "Use an app to track money saved by not vaping.",
  "Watch YouTube videos of ex-vapers for inspiration.",
  "Use breathing apps to ground yourself during cravings.",
  "Set your lock screen with your “why”.",
  "Keep an app that reminds you of health benefits day by day.",
  "Try hypnosis or meditation apps like Headspace or Insight Timer.",
  "Tell friends and family you’re quitting for accountability.",
  "Ask a friend to text or call you during cravings.",
  "Get an accountability partner to quit with.",
  "Post your milestones online to stay encouraged.",
  "Join a local or online support group.",
  "Ask people not to vape around you.",
  "Let coworkers know you’re trying to quit to avoid peer pressure.",
  "Celebrate with friends who support your journey.",
  "Avoid social events early on if they make quitting harder.",
  "Create a “craving call list”—people you can contact in tough moments.",
  "Don’t aim for perfection—just progress.",
  "Visualize yourself vape-free in 1 year.",
  "Practice gratitude daily—write down 3 good things.",
  "Think of cravings as passing clouds, not commands.",
  "Remind yourself that relapse is not failure—it’s feedback.",
  "Reward yourself with small treats after each milestone.",
  "Track how your mood improves without nicotine.",
  "Imagine your lungs healing each day.",
  "See quitting as self-care, not self-deprivation.",
  "Remember: cravings peak and fall—don’t give them power.",
  "Take up journaling or creative writing.",
  "Start a new hobby (drawing, music, coding) to keep busy.",
  "Try adult coloring books or paint-by-number kits.",
  "Learn to cook new recipes.",
  "Start gardening or houseplant care.",
  "Practice a musical instrument.",
  "Do a jigsaw puzzle or brain game.",
  "Learn a new language on Duolingo.",
  "Play with pets—they help relieve stress.",
  "Take up photography or film.",
  "Save the money you’d spend on vape juice in a jar or app.",
  "Calculate your yearly vape spending—shockingly motivating.",
  "Reward yourself with a monthly treat from vape savings.",
  "Set a financial goal (trip, gadget, outfit) with vape money.",
  "Start a visual savings tracker (e.g., graph on your wall).",
  "Reflect monthly on your growth.",
  "Keep your reasons visible—mirror, fridge, lock screen.",
  "Mentor or support others trying to quit—it strengthens your resolve.",
  "Revisit your first week and how far you’ve come.",
  "Remind yourself: You are stronger than the craving. Always."
];



  const getRandomTips = (tips: string[], count: number): string[] => {
    const shuffled = [...tips].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const [carouselTips, setCarouselTips] = useState<string[]>([]);

  useEffect(() => {
    const tips = getRandomTips(quitTips, 5);
    setCarouselTips(tips);
    const extended = [tips[tips.length - 1], ...tips, tips[0]];
    setExtendedTips(extended);
    setTipIndex(0);
  }, []);




  // Remove redeclaration and move fadeTipAnim to a single declaration at the top of the component
  // Only declare tipIndex and setTipIndex here
  const [tipIndex, setTipIndex] = useState(0);
  const [displayedTipIndex, setDisplayedTipIndex] = useState(0);

useEffect(() => {
  if (carouselTips.length === 0) return;

  let timeout: NodeJS.Timeout;

  const fadeOutAndIn = () => {
    Animated.timing(fadeTipAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // Only now update the displayed tip index
      setDisplayedTipIndex((prev) => {
        const next = (prev + 1) % carouselTips.length;
        // After updating, fade in the new tip
        Animated.timing(fadeTipAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
        return next;
      });
    });
  };

  timeout = setInterval(fadeOutAndIn, 5000);

  return () => clearInterval(timeout);
}, [carouselTips, fadeTipAnim]);




  useEffect(() => {
    if (!isFocused || extendedTips.length === 0) return;

    // Jump to the next tip immediately
    let nextIndex = tipIndex + 2;
    if (nextIndex >= extendedTips.length) {
      nextIndex = 1;
    }

    // Set immediately
    // flatListRef.current?.scrollToIndex({ index: nextIndex, animated: false }); // This line is removed
    setTipIndex((prev) => (prev + 1) % carouselTips.length);
  }, [isFocused]);











  const formattedNicotine = `${Number(nicotineMg).toFixed(2)} mg`;

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        const savedLifetimePuffs = await AsyncStorage.getItem('lifetimePuffs');
        const savedLifetimeNicotineMg = await AsyncStorage.getItem('lifetimeNicotineMg');
        const savedLastReset = await AsyncStorage.getItem('lastResetDate');
        const savedDailyLimit = await AsyncStorage.getItem('dailyLimit');
        const savedNicotineStrength = await AsyncStorage.getItem('nicotineStrength');

        if (savedNicotineStrength !== null) {
          console.log('Loaded nicotineStrength:', savedNicotineStrength);
          setNicotineStrength(savedNicotineStrength);
        } else {
          await AsyncStorage.setItem('nicotineStrength', '0');
          setNicotineStrength('0');
        }

        const today = new Date().toISOString().split('T')[0];
        

        if (savedLastReset !== today) {
          const today = new Date().toISOString().split('T')[0];
          const savedPuffTimes = await AsyncStorage.getItem(`puffTimes-${today}`);
          let puffTimes: Array<string | PuffEntry> = savedPuffTimes ? JSON.parse(savedPuffTimes) : [];
          const currentStrength = parseFloat(savedNicotineStrength || '0') || 0;

          const dailyPuffs = puffTimes.filter(item => {
            const puffDate = new Date(typeof item === 'string' ? item : item.time);
            return puffDate.toISOString().split('T')[0] === savedLastReset;
          }).length;

          const dailyNicotine = puffTimes.reduce((sum, item) => {
            if (typeof item === 'string') {
              return sum + currentStrength;
            } else {
              return sum + item.strength;
            }
          }, 0);

          const newLifetimePuffs = (savedLifetimePuffs ? parseInt(savedLifetimePuffs, 10) : 0) + dailyPuffs;
          const newLifetimeNicotineMg = (savedLifetimeNicotineMg ? parseFloat(savedLifetimeNicotineMg) : 0) + dailyNicotine;

          setLifetimePuffs(newLifetimePuffs);
          setLifetimeNicotineMg(newLifetimeNicotineMg);
          setPuffCount(0);
          setNicotineMg(0);
          setLastResetDate(today);

          
          await AsyncStorage.setItem(`puffTimes-${today}`, JSON.stringify(puffTimes));
          await AsyncStorage.setItem('lifetimePuffs', newLifetimePuffs.toString());
          await AsyncStorage.setItem('lifetimeNicotineMg', newLifetimeNicotineMg.toString());
          await AsyncStorage.setItem('lastResetDate', today);
        } else {
          setLifetimePuffs(savedLifetimePuffs ? parseInt(savedLifetimePuffs, 10) : 0);
          setLifetimeNicotineMg(savedLifetimeNicotineMg ? parseFloat(savedLifetimeNicotineMg) : 0);
          const savedNicotineMg = await AsyncStorage.getItem(`nicotineMg-${today}`);
          setNicotineMg(savedNicotineMg ? parseFloat(savedNicotineMg) : 0);

          setLastResetDate(savedLastReset);
        }

        setIsInitialized(true); // ✅ signal ready
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    const loadQuitPlanInfo = async () => {
      const plan = await AsyncStorage.getItem('quitPlanData');
      if (!plan) {
        setTodayLimit(null);
        setQuitDate('Not set');
        return;
      }

      try {
        const parsed = JSON.parse(plan);
        const { puffLimitData, startDate, targetDate, quitDateStored } = parsed;

        if (targetDate) {
          const formatted = new Date(targetDate).toLocaleDateString();
          setQuitDate(formatted);
        } else {
          setQuitDate('Not set');
        }

        if (quitDateStored && Array.isArray(puffLimitData) && startDate) {
          const start = new Date(startDate);
          const now = new Date();
          const daysPassed = Math.floor(
            (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
             new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()) /
            (1000 * 60 * 60 * 24)
          );

          const limit = puffLimitData[daysPassed] ?? null;
          setTodayLimit(typeof limit === 'number' ? limit : null);
        } else {
          setTodayLimit(null);
        }

      } catch (err) {
        console.error('Error loading plan info:', err);
        setTodayLimit(null);
        setQuitDate('Not set');
      }
    };

    InteractionManager.runAfterInteractions(() => {
      loadData();
      loadQuitPlanInfo();
    });
  }, []);

  const [quitDate, setQuitDate] = useState<string>('Not set');


useEffect(() => {
  const loadQuitPlanInfo = async () => {
    const plan = await AsyncStorage.getItem('quitPlanData');
    if (!plan) {
      setTodayLimit(null);
      setQuitDate('Not set');
      return;
    }

    try {
      const parsed = JSON.parse(plan);
      const { puffLimitData, startDate, targetDate, quitDateStored } = parsed;

      if (targetDate) {
        const formatted = new Date(targetDate).toLocaleDateString();
        setQuitDate(formatted);
      } else {
        setQuitDate('Not set');
      }

      if (quitDateStored && Array.isArray(puffLimitData) && startDate) {
        const start = new Date(startDate);
        const now = new Date();
        const daysPassed = Math.floor(
          (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
           new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()) /
          (1000 * 60 * 60 * 24)
        );

        const limit = puffLimitData[daysPassed] ?? null;
        setTodayLimit(typeof limit === 'number' ? limit : null);
      } else {
        setTodayLimit(null);
      }

    } catch (err) {
      console.error('Error loading plan info:', err);
      setTodayLimit(null);
      setQuitDate('Not set');
    }
  };

  loadQuitPlanInfo();
}, [refreshKey]); // 🔁 Triggers when tab index changes





  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTimeText(getRelativeTimeText(lastPuffTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [lastPuffTime]);




  const handlePuff = async () => {
    if (isPuffButtonDisabled) return;
    setIsPuffButtonDisabled(true);
    const strength = parseFloat(nicotineStrength) || 0;
    const nicotinePerPuff = 0.005 * strength;
    const now = new Date();

    // 🔄 Update timer & nicotine display immediately
    setLastPuffTime(now);
    const newNicotineMg = nicotineMg + nicotinePerPuff;
    setNicotineMg(newNicotineMg);
    setPuffCount(prev => prev + 1); // 🔥 Add this back in
    setPuffTrigger((puffTrigger + 1));

    const secondsSinceLastPuff = lastPuffTime ? Math.floor((now.getTime() - lastPuffTime.getTime()) / 1000) : 0;

    if (secondsSinceLastPuff > longestTime) {
      setLongestTime(secondsSinceLastPuff);
      await AsyncStorage.setItem('longestTime', secondsSinceLastPuff.toString());
    }


    const puffTime = now.toISOString();
    const puffEntry: PuffEntry = { time: puffTime, strength };
    const today = new Date().toISOString().split('T')[0];

    try {
      const savedDaily = await AsyncStorage.getItem(`puffTimes-${today}`);
      const dailyPuffTimes = savedDaily ? JSON.parse(savedDaily) : [];

      dailyPuffTimes.push(puffEntry);

      await AsyncStorage.setItem(`puffTimes-${today}`, JSON.stringify(dailyPuffTimes));
      await AsyncStorage.setItem('lastPuffTimestamp', puffTime);
      await AsyncStorage.setItem(`nicotineMg-${today}`, newNicotineMg.toString());

      setShowStats(true);
      fadeAnim.setValue(1);
    } catch (error) {
      console.error('Error saving puff data:', error);
    }
    setTimeout(() => setIsPuffButtonDisabled(false), 500);
  };

  const animatePuffButton = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }).start();
    });
  };




  const handleCirclePress = () => {
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    const strength = parseFloat(nicotineStrength);

    if (
      nicotineStrength.trim() === '' ||
      isNaN(strength) ||
      strength < 0
    ) {
      Alert.alert('Invalid input', 'Please enter a valid number that is 0 or more.');
      return;
    }

    try {
      await AsyncStorage.setItem('nicotineStrength', nicotineStrength);
      console.log('Saved nicotineStrength to storage:', nicotineStrength);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };




  useEffect(() => {
    const loadTodayPuffCount = async () => {
      const today = new Date().toISOString().split('T')[0];
      try {
        const savedPuffTimes = await AsyncStorage.getItem(`puffTimes-${today}`);
        const puffTimes = savedPuffTimes ? JSON.parse(savedPuffTimes) : [];
        setPuffCount(puffTimes.length);
        setPuffCountLoaded(true); // ✅ Now it's safe to show
      } catch (err) {
        console.error('Failed to load today\'s puff count:', err);
        setPuffCount(0);
        setPuffCountLoaded(true); // Still allow render, even if 0
      }
    };

    if (isInitialized) {
      loadTodayPuffCount();
    }
  }, [isInitialized]);


  useEffect(() => {
    const restoreLastPuff = async () => {
      const lastPuffStr = await AsyncStorage.getItem('lastPuffTimestamp');
      const longestStr = await AsyncStorage.getItem('longestTime');

      if (lastPuffStr) {
        setLastPuffTime(new Date(lastPuffStr));
      }
      if (longestStr) {
        setLongestTime(parseInt(longestStr, 10) || 0);
      }
    };

    if (isInitialized) {
      restoreLastPuff();
    }
  }, [isInitialized]);



  useEffect(() => {
    if (!isFocused || carouselTips.length === 0) return;

    const interval = setInterval(() => {
      Animated.timing(fadeTipAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // ✅ Set new tip while hidden
        setTipIndex((prev) => (prev + 1) % carouselTips.length);

        // ✅ Then fade in new tip
        Animated.timing(fadeTipAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [carouselTips, isFocused]);








  const getTimeSinceLastPuff = (): number => {
    if (!lastPuffTime) return 0;
    const now = new Date();
    const seconds = Math.floor((now.getTime() - lastPuffTime.getTime()) / 1000);
    return seconds >= 0 ? seconds : 0;
  };

  const currentElapsed = getTimeSinceLastPuff();

  useEffect(() => {
    if (currentElapsed > longestTime) {
      setLongestTime(currentElapsed);
    }
  }, [currentElapsed]);




  return (
    <View style={styles.container}>
      <View style={styles.counterContainer}>
        <Animated.View style={{ opacity: fadeIn }}>
          <Text style={[styles.counterText, { color: '#fff' }]}>{puffCount}</Text>
        </Animated.View>
        <Text style={[styles.counterLabel, { color: '#fff' }]}>PUFFS TODAY</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20, width: '100%' }}>
        <View style={styles.timerCard}>
          <Text style={styles.cardLbl}>Puff Limit</Text>
          <Text style={styles.cardNumber}>{todayLimit ?? 'Not Set'}</Text>
        </View>
        <View style={styles.timerCard}>
          <Text style={styles.cardLbl}>Nicotine</Text>
          <Text style={styles.cardNumber}>{formattedNicotine}</Text>
        </View>
        <View style={styles.timerCard}>
          <Text style={styles.cardLbl}>Last Puff</Text>
          <Text style={styles.cardNumber}>{relativeTimeText}</Text>
        </View>
        <View style={styles.timerCard}>
          <Text style={styles.cardLbl}>Record Time</Text>
          <Text style={styles.cardNumber}>{getDurationText(Math.max(longestTime, currentElapsed))}</Text>
        </View>
      </View>


      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Quitting Tips</Text>
        {isFocused && (
        <Animated.View style={{ opacity: fadeTipAnim }}>
          <Text style={[styles.tipText, { textAlign: 'left' }]}> {carouselTips[displayedTipIndex]} </Text>
        </Animated.View>
        )}
      </View>


      {/* Puff Button with animated shrink/grow */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <LinearGradient
          colors={['#EF4444', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.puffGradient}
        >
          <TouchableOpacity
            onPress={() => {
              animatePuffButton(); // 🔁 play animation
              handlePuff();        // 🫧 do puff logic
            }}
            style={styles.puffButton}
            activeOpacity={1}
            disabled={isPuffButtonDisabled}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="add" size={30} color="#000" />
                <Text style={styles.puffButtonText}>PUFF</Text>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>









      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Nicotine Strength</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={nicotineStrength}
                onChangeText={setNicotineStrength}
                placeholder="e.g., 3"
              />
              <Text style={styles.inputUnit}>mg/ml</Text>
            </View>
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Edit Puff Count Modal */}
      <Modal
        transparent={true}
        visible={showEditCountModal}
        animationType="fade"
        onRequestClose={() => setShowEditCountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Your Count</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={editCountValue}
                onChangeText={setEditCountValue}
                placeholder="0"
              />
            </View>
            <Pressable
              style={styles.saveButton}
              onPress={async () => {
                const val = parseInt(editCountValue, 10);
                if (!isNaN(val) && val >= 0) {
                  // Bulk edit logic: update puffTimes for today
                  const today = new Date().toISOString().split('T')[0];
                  const savedPuffTimes = await AsyncStorage.getItem(`puffTimes-${today}`);
                  let puffTimes = savedPuffTimes ? JSON.parse(savedPuffTimes) : [];
                  const prevCount = puffTimes.length;
                  const prevNicotineMg = parseFloat(await AsyncStorage.getItem(`nicotineMg-${today}`) || '0');
                  if (val > prevCount) {
                    // Add new puffs, update last puff time
                    const now = new Date();
                    const nicotineStrength = await AsyncStorage.getItem('nicotineStrength');
                    const strength = parseFloat(nicotineStrength || '0') || 0;
                    for (let i = prevCount; i < val; i++) {
                      puffTimes.push({ time: now.toISOString(), strength });
                    }
                    await AsyncStorage.setItem(`puffTimes-${today}`, JSON.stringify(puffTimes));
                    await AsyncStorage.setItem('lastPuffTimestamp', now.toISOString());
                    setLastPuffTime(now); // Force update immediately
                  } else if (val < prevCount) {
                    // Remove puffs, do not update last puff time
                    puffTimes = puffTimes.slice(0, val);
                    await AsyncStorage.setItem(`puffTimes-${today}`, JSON.stringify(puffTimes));
                    if (val <= 0) {
                      setNicotineMg(0);
                      await AsyncStorage.setItem(`nicotineMg-${today}`, '0');
                      setLastPuffTime(null);
                      await AsyncStorage.removeItem('lastPuffTimestamp');
                    } else {
                      // Proportionally reduce nicotineMg
                      let newNicotineMg = 0;
                      if (prevCount > 0) {
                        newNicotineMg = (val / prevCount) * prevNicotineMg;
                      }
                      setNicotineMg(newNicotineMg);
                      await AsyncStorage.setItem(`nicotineMg-${today}`, newNicotineMg.toString());
                    }
                  }
                  setPuffCount(val);
                  setShowEditCountModal(false);
                  // Always reload nicotineMg and lastPuffTime from storage after bulk edit
                  setTimeout(async () => {
                    const savedNicotineMg = await AsyncStorage.getItem(`nicotineMg-${today}`);
                    setNicotineMg(savedNicotineMg ? parseFloat(savedNicotineMg) : 0);
                    const lastPuffStr = await AsyncStorage.getItem('lastPuffTimestamp');
                    setLastPuffTime(lastPuffStr ? new Date(lastPuffStr) : null);
                  }, 0);
                } else {
                  Alert.alert('Invalid input', 'Please enter a valid number that is 0 or more.');
                }
              }}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    paddingTop: verticalScale(0),
    paddingHorizontal: scale(24),
    paddingBottom: verticalScale(30),
  },
  titleContainer: {
    marginBottom: verticalScale(20),
  },
  counterContainer: {
    paddingTop: verticalScale(20),
    alignItems: 'center',
  },
  counterCircle: {
    width: scale(200),
    height: scale(200),
    borderRadius: scale(100),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  counterText: {
    fontSize: scale(60),
    fontWeight: 'bold',
    color: '#000',
  },
  counterLabel: {
    fontSize: scale(18),
    color: '#000',
  },
  nicotineText: {
    fontSize: scale(16),
    color: 'rgba(229, 0, 0, 1)',
    marginTop: verticalScale(12),
  },
  nicotineLabel: {
    fontSize: scale(14),
    color: '#000',
  },
  puffGradient: {
    alignSelf: 'center',
    minWidth: scale(220),
    borderRadius: scale(30),
    marginTop: verticalScale(30),
  },
  puffButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(50),
    borderRadius: scale(30),
    position: 'relative',
    minWidth: scale(200),
    alignSelf: 'center',
  },
  puffButtonText: {
    color: '#000',
    fontSize: scale(20),
    fontWeight: '600',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    paddingVertical: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    paddingVertical: verticalScale(30),
    paddingHorizontal: scale(30),
    borderRadius: scale(20),
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 10,
  },

  modalTitle: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(15),
    width: '80%',
  },
  inputLabel: {
    fontSize: scale(16),
    marginRight: scale(10),
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: scale(10),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(15),
    flex: 1,
    textAlign: 'center',
    fontSize: scale(16),
    backgroundColor: '#1a1a1a',
    color: '#fff'
  },

  inputUnit: {
    fontSize: scale(16),
    marginLeft: scale(5),
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#fff',
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(40),
    borderRadius: scale(30),
    marginTop: verticalScale(10),
    width: '100%',
  },
  saveButtonText: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },

  appTitle: {
    fontSize: scale(28),
    fontWeight: 'bold',
  },
  vapeText: {
    color: '#FF3333',
  },
  freeText: {
    color: '#FFFFFF',
  },
  nicotineCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: scale(10),
    padding: scale(15),
    marginTop: verticalScale(20),
    width: '90%',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: scale(16),
    color: '#CCCCCC',
    marginBottom: verticalScale(5),
  },
  cardValue: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#E50000',
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: verticalScale(20),
    width: '100%',
  },
  timerCard: {
    alignItems: 'center',
    backgroundColor: '#020202',
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(10),
    borderRadius: scale(10),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    width: '48%',
    marginBottom: verticalScale(12),
  },
  cardNumber: {
    fontSize: scale(14),
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardLbl: {
    fontSize: scale(13),
    color: '#ffffff',
    marginTop: verticalScale(5),
  },
  tipCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: scale(10),
    padding: scale(20),
    marginTop: verticalScale(20),
    width: '90%',
    height: verticalScale(140),
  },
  tipTitle: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: verticalScale(10),
  },
  tipText: {
    fontSize: scale(14),
    color: '#ccc',
    marginBottom: verticalScale(10),
    flexWrap: 'wrap',
    flexShrink: 1,
    width: '85%',
  },
  tipListItem: {
    color: '#333',
    fontSize: scale(14),
    marginBottom: verticalScale(5),
  },
  
  gradientButton: {
    width: '100%',
    borderRadius: scale(30),
    marginTop: verticalScale(20),
  },
});

// Memoized tip item
const TipItem = memo(({ tip }: { tip: string }) => (
  <Text style={[styles.tipText, { textAlign: 'left' }]}>{tip}</Text>
));


export default forwardRef(HomeScreen);