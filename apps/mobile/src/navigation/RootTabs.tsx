import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AddScreen } from '../screens/AddScreen';
import { LocalTableScreen } from '../screens/LocalTableScreen';
import { RemoteTableScreen } from '../screens/RemoteTableScreen';
import { colors } from '../ui/theme';

export type RootTabParamList = {
  Add: undefined;
  Local: undefined;
  Remote: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size }) => {
          const name =
            route.name === 'Add'
              ? 'add-circle-outline'
              : route.name === 'Local'
                ? 'phone-portrait-outline'
                : 'cloud-outline';
          return (
            <Ionicons
              name={name}
              size={size}
              color={color}
              importantForAccessibility="no"
              accessibilityElementsHidden
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Add"
        component={AddScreen}
        options={{ title: 'Adicionar', tabBarAccessibilityLabel: 'Adicionar nota' }}
      />
      <Tab.Screen
        name="Local"
        component={LocalTableScreen}
        options={{ title: 'Local', tabBarAccessibilityLabel: 'Tabela local no aparelho' }}
      />
      <Tab.Screen
        name="Remote"
        component={RemoteTableScreen}
        options={{ title: 'Backend', tabBarAccessibilityLabel: 'Tabela no backend' }}
      />
    </Tab.Navigator>
  );
}
