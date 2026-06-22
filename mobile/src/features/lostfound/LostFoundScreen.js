import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Animated, KeyboardAvoidingView, ActivityIndicator, Linking, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../theme/theme';
import { AuthContext } from '../../context/AuthContext';
import { BASE_URL } from '../../config/api';

// Components
import LostFoundCard from './LostFoundCard';
import ReportForm from './ReportForm';
import VaultModal from './VaultModal';
import HistoryModal from './HistoryModal';

// Standard React Native Alert works on web in recent Expo versions
const confirmAction = (title, message, onConfirm) => {
    Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onConfirm }
    ]);
};

export default function LostFoundScreen() {
    const { token, currentUser } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('lost');
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Form States
    const [formType, setFormType] = useState('lost');
    const [formTitle, setFormTitle] = useState('');
    const [formLocation, setFormLocation] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formImage, setFormImage] = useState(null);

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Delete Modal State
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Vault States
    const [isVaultModalVisible, setIsVaultModalVisible] = useState(false);
    const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
    const [newVaultTitle, setNewVaultTitle] = useState('');
    const [newVaultSubtext, setNewVaultSubtext] = useState('');
    const [newVaultImage, setNewVaultImage] = useState(null);
    const [vaultItems, setVaultItems] = useState([]);

    const scrollY = React.useRef(new Animated.Value(0)).current;

    const pickImage = async (type) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            if (type === 'form') {
                setFormImage(result.assets[0].uri);
            } else if (type === 'vault') {
                setNewVaultImage(result.assets[0].uri);
            }
        }
    };

    useEffect(() => {
        if (token) {
            fetchItems();
            fetchVaultItems();
        }
    }, [token]);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/lostfound`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(res.data);
        } catch (error) {
            console.error('Error fetching lost & found items:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchVaultItems = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/vault`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVaultItems(res.data);
        } catch (error) {
            console.error('Error fetching vault items:', error);
        }
    };

    const handleAddVaultItem = async () => {
        if (!newVaultTitle) return;
        
        try {
            const res = await axios.post(`${BASE_URL}/vault`, {
                title: newVaultTitle,
                subtext: newVaultSubtext || 'My Item',
                image: newVaultImage || 'https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=400&auto=format&fit=crop'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVaultItems([res.data, ...vaultItems]);
            setNewVaultTitle('');
            setNewVaultSubtext('');
            setNewVaultImage(null);
            setIsVaultModalVisible(false);
        } catch (error) {
            console.error('Error adding vault item:', error);
        }
    };

    const handleDeleteVaultItem = async (id) => {
        try {
            await axios.delete(`${BASE_URL}/vault/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVaultItems(vaultItems.filter(item => item._id !== id));
        } catch (error) {
            console.error('Error deleting vault item:', error);
        }
    };

    const handleSelectFromVault = (item) => {
        setFormTitle(item.title);
        setFormDesc(item.subtext || '');
        setFormImage(item.image);
    };

    const handlePublishReport = async () => {
        setIsLoading(true);
        try {
            const postData = {
                type: formType,
                title: formTitle,
                description: formDesc,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                location: formLocation,
                image: formImage,
                phoneNumber: formPhone
            };

            if (isEditing) {
                const res = await axios.put(`${BASE_URL}/lostfound/${editingId}`, postData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setItems(items.map(it => it._id === editingId ? res.data : it));
                if (Platform.OS === 'web') {
                    window.alert('Report updated successfully!');
                } else {
                    Alert.alert('Success', 'Report updated successfully!');
                }
            } else {
                const res = await axios.post(`${BASE_URL}/lostfound`, postData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setItems([res.data, ...items]);
                if (Platform.OS === 'web') {
                    window.alert('Report published successfully!');
                } else {
                    Alert.alert('Success', 'Report published successfully!');
                }
            }
            
            resetForm();
        } catch (error) {
            console.error('Error publishing report:', error);
            if (Platform.OS === 'web') {
                window.alert('Failed to publish report. Please try again.');
            } else {
                Alert.alert('Error', 'Failed to publish report. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormTitle('');
        setFormLocation('');
        setFormDesc('');
        setFormPhone('');
        setFormImage(null);
        setIsEditing(false);
        setEditingId(null);
        setShowAddForm(false);
    };

    const handleContact = (phone) => {
        if (!phone) {
            if (Platform.OS === 'web') {
                window.alert('No phone number provided for this report.');
            } else {
                Alert.alert('No Contact', 'No phone number provided for this report.');
            }
            return;
        }
        Linking.openURL(`tel:${phone}`);
    };

    const handleEditPortalPost = (item) => {
        setFormType(item.type);
        setFormTitle(item.title);
        setFormLocation(item.location);
        setFormDesc(item.description || '');
        setFormPhone(item.phoneNumber || '');
        setFormImage(item.image);
        setIsEditing(true);
        setEditingId(item._id);
        setIsHistoryModalVisible(false);
        setShowAddForm(true);
    };

    const handleDeletePortalPost = (id) => {
        setItemToDelete(id);
        setIsDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const endpoint = currentUser?.role === 'admin'
                ? `${BASE_URL}/lostfound/admin/${itemToDelete}`
                : `${BASE_URL}/lostfound/${itemToDelete}`;

            await axios.delete(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(items.filter(it => it._id !== itemToDelete));
            setIsDeleteModalVisible(false);
            setItemToDelete(null);
        } catch (error) {
            console.error('Delete error:', error);
            if (Platform.OS === 'web') {
                window.alert('Failed to delete post.');
            } else {
                Alert.alert('Error', 'Failed to delete post.');
            }
            setIsDeleteModalVisible(false);
        }
    };

    // Status change handler
    const handleStatusChange = async (itemId, newStatus) => {
        try {
            const res = await axios.put(`${BASE_URL}/lostfound/status/${itemId}`, {
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(items.map(it => it._id === itemId ? res.data : it));
        } catch (error) {
            console.error('Error updating status:', error);
            if (Platform.OS === 'web') {
                window.alert('Failed to update status.');
            } else {
                Alert.alert('Error', 'Failed to update status.');
            }
        }
    };

    // Filter items
    const filteredItems = items.filter(item => {
        const matchesFilter = item.type === activeFilter;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const myItems = currentUser?.role === 'admin' ? items : items.filter(it => it.reporter?._id === currentUser?._id);

    // ==================== RENDER ====================

    if (showAddForm) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: '#F8F9FE' }]}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ReportForm
                        isEditing={isEditing}
                        formType={formType} setFormType={setFormType}
                        formTitle={formTitle} setFormTitle={setFormTitle}
                        formLocation={formLocation} setFormLocation={setFormLocation}
                        formDesc={formDesc} setFormDesc={setFormDesc}
                        formPhone={formPhone} setFormPhone={setFormPhone}
                        formImage={formImage}
                        isLoading={isLoading}
                        vaultItems={vaultItems}
                        onPickImage={() => pickImage('form')}
                        onSelectFromVault={handleSelectFromVault}
                        onOpenVault={() => setIsVaultModalVisible(true)}
                        onPublish={handlePublishReport}
                        onClose={() => { setShowAddForm(false); setIsEditing(false); }}
                    />
                </KeyboardAvoidingView>
                <VaultModal
                    visible={isVaultModalVisible}
                    onClose={() => setIsVaultModalVisible(false)}
                    vaultItems={vaultItems}
                    newVaultTitle={newVaultTitle} setNewVaultTitle={setNewVaultTitle}
                    newVaultImage={newVaultImage}
                    onPickImage={() => pickImage('vault')}
                    onAddItem={handleAddVaultItem}
                    onDeleteItem={handleDeleteVaultItem}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Absolute Sticky Toggle */}
            <Animated.View style={[styles.absoluteStickyToggle, {
                opacity: scrollY.interpolate({
                    inputRange: [140, 180],
                    outputRange: [0, 1],
                    extrapolate: 'clamp'
                }),
                transform: [{
                    translateY: scrollY.interpolate({
                        inputRange: [140, 180],
                        outputRange: [-10, 0],
                        extrapolate: 'clamp'
                    })
                }]
            }]}>
                <View style={styles.toggleContainerWrapper}>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity 
                            style={[styles.toggleBtn, activeFilter === 'lost' && styles.toggleBtnActiveLost]}
                            onPress={() => setActiveFilter('lost')}
                        >
                            <Ionicons name="alert-circle-outline" size={16} color={activeFilter === 'lost' ? theme.colors.textMain : theme.colors.textSub} style={{ marginRight: 4 }} />
                            <Text style={[styles.toggleText, activeFilter === 'lost' && styles.toggleTextActive]}>Missing Items</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.toggleBtn, activeFilter === 'found' && styles.toggleBtnActiveFound]}
                            onPress={() => setActiveFilter('found')}
                        >
                            <Ionicons name="checkmark-circle-outline" size={16} color={activeFilter === 'found' ? '#FFFFFF' : theme.colors.textSub} style={{ marginRight: 4 }} />
                            <Text style={[styles.toggleText, activeFilter === 'found' && [styles.toggleTextActive, { color: '#FFFFFF' }]]}>Found Items</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>

            <Animated.ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                <View style={styles.headerArea}>
                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <View>
                            <Text style={styles.subTitle}>CAMPUS BOARD</Text>
                            <Text style={styles.mainTitle}>Lost & Found</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity 
                                style={styles.historyButton} 
                                onPress={() => setIsHistoryModalVisible(true)}
                            >
                                <Ionicons name="time-outline" size={22} color={theme.colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.addButton} 
                                onPress={() => {
                                    setIsEditing(false);
                                    setEditingId(null);
                                    resetForm();
                                    setShowAddForm(true);
                                }}
                            >
                                <Ionicons name="add" size={22} color={theme.colors.white} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={18} color={theme.colors.textSub} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for items..."
                            placeholderTextColor={theme.colors.textSub}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={theme.colors.textSub} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filter Toggle */}
                    <View style={{ marginBottom: 16 }}>
                        <View style={styles.toggleContainerWrapper}>
                            <View style={styles.toggleContainer}>
                                <TouchableOpacity 
                                    style={[styles.toggleBtn, activeFilter === 'lost' && styles.toggleBtnActiveLost]}
                                    onPress={() => setActiveFilter('lost')}
                                >
                                    <Ionicons name="alert-circle-outline" size={16} color={activeFilter === 'lost' ? theme.colors.textMain : theme.colors.textSub} style={{ marginRight: 4 }} />
                                    <Text style={[styles.toggleText, activeFilter === 'lost' && styles.toggleTextActive]}>Missing Items</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.toggleBtn, activeFilter === 'found' && styles.toggleBtnActiveFound]}
                                    onPress={() => setActiveFilter('found')}
                                >
                                    <Ionicons name="checkmark-circle-outline" size={16} color={activeFilter === 'found' ? '#FFFFFF' : theme.colors.textSub} style={{ marginRight: 4 }} />
                                    <Text style={[styles.toggleText, activeFilter === 'found' && [styles.toggleTextActive, { color: '#FFFFFF' }]]}>Found Items</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Results count */}
                    <View style={styles.resultsRow}>
                        <Text style={styles.resultsText}>
                            {filteredItems.length} {activeFilter === 'lost' ? 'missing' : 'found'} item{filteredItems.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                </View>

                {isLoading ? (
                    <View style={styles.emptyContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={[styles.emptyText, { marginTop: 12 }]}>Loading items...</Text>
                    </View>
                ) : filteredItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconWrap}>
                            <Ionicons name={activeFilter === 'lost' ? "search-outline" : "checkmark-done-outline"} size={36} color={theme.colors.textSub} />
                        </View>
                        <Text style={styles.emptyTitle}>No {activeFilter === 'lost' ? 'missing' : 'found'} items</Text>
                        <Text style={styles.emptyText}>
                            {activeFilter === 'lost' 
                                ? "No lost items have been reported yet." 
                                : "No found items have been reported yet."}
                        </Text>
                    </View>
                ) : (
                    filteredItems.map(item => (
                        <LostFoundCard
                            key={item._id}
                            item={item}
                            onContact={handleContact}
                        />
                    ))
                )}
            </Animated.ScrollView>

            <VaultModal
                visible={isVaultModalVisible}
                onClose={() => setIsVaultModalVisible(false)}
                vaultItems={vaultItems}
                newVaultTitle={newVaultTitle} setNewVaultTitle={setNewVaultTitle}
                newVaultImage={newVaultImage}
                onPickImage={() => pickImage('vault')}
                onAddItem={handleAddVaultItem}
                onDeleteItem={handleDeleteVaultItem}
            />
            <HistoryModal
                visible={isHistoryModalVisible}
                onClose={() => setIsHistoryModalVisible(false)}
                myItems={myItems}
                onEdit={handleEditPortalPost}
                onDelete={handleDeletePortalPost}
                onStatusChange={handleStatusChange}
                currentUser={currentUser}
            />

            {/* Custom Delete Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isDeleteModalVisible}
                onRequestClose={() => setIsDeleteModalVisible(false)}
            >
                <View style={styles.deleteModalOverlay}>
                    <View style={styles.deleteModalContainer}>
                        <View style={styles.deleteModalIcon}>
                            <Ionicons name="warning" size={32} color="#EF4444" />
                        </View>
                        <Text style={styles.deleteModalTitle}>Delete Post?</Text>
                        <Text style={styles.deleteModalText}>Are you sure you want to remove this post? This action cannot be undone.</Text>
                        <View style={styles.deleteModalActions}>
                            <TouchableOpacity 
                                style={styles.deleteModalBtnCancel}
                                onPress={() => setIsDeleteModalVisible(false)}
                            >
                                <Text style={styles.deleteModalBtnCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.deleteModalBtnConfirm}
                                onPress={confirmDelete}
                            >
                                <Text style={styles.deleteModalBtnConfirmText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    headerArea: {
        paddingTop: Platform.OS === 'ios' ? 100 : 120,
    },
    absoluteStickyToggle: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 90 : 85, 
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: theme.colors.background,
        paddingTop: 10,
        paddingBottom: 10,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 14,
    },
    subTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#3b4382',
        letterSpacing: 1.2,
        marginBottom: 4,
    },
    mainTitle: {
        fontSize: 30,
        fontWeight: '900',
        color: theme.colors.textMain,
    },
    addButton: {
        backgroundColor: theme.colors.primary,
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    historyButton: {
        backgroundColor: theme.colors.white,
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EBECEF',
        borderRadius: 14,
        paddingHorizontal: 14,
        marginHorizontal: 20,
        height: 48,
        marginBottom: 14,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.textMain,
        fontWeight: '500',
    },
    toggleContainerWrapper: {
        paddingHorizontal: 20,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#EBECEF',
        borderRadius: 16,
        padding: 3,
    },
    toggleBtn: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 10,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleBtnActiveLost: {
        backgroundColor: theme.colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleBtnActiveFound: {
        backgroundColor: '#059669',
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    toggleText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.textSub,
    },
    toggleTextActive: {
        color: theme.colors.textMain,
        fontWeight: '700',
    },
    resultsRow: {
        paddingHorizontal: 24,
        marginBottom: 6,
    },
    resultsText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textSub,
        letterSpacing: 0.3,
    },
    scrollContent: {
        paddingBottom: 100,
        paddingTop: 10,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        paddingHorizontal: 40,
    },
    emptyIconWrap: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: '#F3F4FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#1E1B4B',
        marginBottom: 6,
    },
    emptyText: {
        color: theme.colors.textSub,
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    // Delete Modal Styles
    deleteModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    deleteModalContainer: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    deleteModalIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    deleteModalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    deleteModalText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    deleteModalActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    deleteModalBtnCancel: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    deleteModalBtnCancelText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#4B5563',
    },
    deleteModalBtnConfirm: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#EF4444',
        alignItems: 'center',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    deleteModalBtnConfirmText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
