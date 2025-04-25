import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, Animated, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { updatePassword } from 'firebase/auth';
import { useFirestore } from '@/context/storageFirebase';
import formatDate from '@/timeParse';

interface UserProfile {
  address: string;
  avatar: string;
  createdAt: string;
  fullName: string;
  id: string;
  phone: string;
  role: string;
  updatedAt: string;
  username: string;
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const { getDocument } = useFirestore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  const togglePasswordSection = () => {
    setIsPasswordSectionOpen(!isPasswordSectionOpen);
    Animated.timing(animatedHeight, {
      toValue: isPasswordSectionOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const userData = await getDocument('users', user.uid);
          setUserProfile(userData as UserProfile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới không khớp');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setIsChangingPassword(true);
      await updatePassword(user!, newPassword);
      Alert.alert('Thành công', 'Đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      Alert.alert('Lỗi', 'Không thể đổi mật khẩu. Vui lòng thử lại sau');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {userProfile?.avatar ? (
            <Image 
              source={{ uri: userProfile.avatar }} 
              style={styles.avatar}
              defaultSource={require('@/assets/images/icon.png')}
            />
          ) : (
            <View style={styles.defaultAvatarContainer}>
              <Ionicons name="person-circle-outline" size={80} color="#2196F3" />
            </View>
          )}
          <View style={styles.editAvatarButton}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </View>
        <Text style={styles.fullName}>{userProfile?.fullName || 'Chưa cập nhật'}</Text>
        <Text style={styles.role}>Người giao hàng</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="person-outline" size={20} color="#FF0000" />
          <Text style={styles.infoLabel}>Họ tên:</Text>
          <Text style={styles.infoText}>{userProfile?.fullName || 'Chưa cập nhật'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="call-outline" size={20} color="#2196F3" />
          <Text style={styles.infoLabel}>Số điện thoại:</Text>
          <Text style={styles.infoText}>{userProfile?.phone || 'Chưa cập nhật'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="mail-outline" size={20} color="#FF9800" />
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoText}>{user?.email}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={20} color="#4CAF50" />
          <Text style={styles.infoLabel}>Địa chỉ:</Text>
          <Text style={styles.infoText}>{userProfile?.address || 'Chưa cập nhật'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={20} color="#333399" />
          <Text style={styles.infoLabel}>Tham gia:</Text>
          <Text style={styles.infoText}>
            {userProfile?.createdAt ? formatDate(userProfile.createdAt) : 'Không xác định'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.sectionHeader} 
          onPress={togglePasswordSection}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="lock-closed" size={24} color="#2196F3" />
            <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
          </View>
          <Animated.View style={{
            transform: [{
              rotate: animatedHeight.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '180deg']
              })
            }]
          }}>
            <Ionicons name="chevron-down" size={24} color="#666" />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View style={{
          maxHeight: animatedHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 300]
          }),
          opacity: animatedHeight,
          overflow: 'hidden'
        }}>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu hiện tại"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu mới"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu mới"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity
            style={[
              styles.changePasswordButton,
              isChangingPassword && styles.changePasswordButtonDisabled
            ]}
            onPress={handleChangePassword}
            disabled={isChangingPassword}
          >
            <Text style={styles.changePasswordButtonText}>
              {isChangingPassword ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 24,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  defaultAvatarContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fullName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  role: {
    fontSize: 13,
    color: '#666',
    textTransform: 'capitalize',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 9,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  infoLabel: {
    width: 100,
    fontSize: 15,
    color: '#666',
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  changePasswordButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  changePasswordButtonDisabled: {
    backgroundColor: '#ccc',
  },
  changePasswordButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});