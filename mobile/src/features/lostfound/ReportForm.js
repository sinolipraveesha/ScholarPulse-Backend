import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

// Sri Lankan phone validation: 07X XXXXXXX (10 digits) or +947X XXXXXXX or 0XX XXXXXXX (landline)
const validateSLPhone = (phone) => {
    if (!phone || phone.trim() === '') return { valid: false, message: 'Phone number is required' };
    const cleaned = phone.replace(/[\s\-()]/g, '');
    // Mobile: 07X followed by 7 digits
    if (/^07[0-9]{8}$/.test(cleaned)) return { valid: true, message: '' };
    // Mobile with +94: +947X followed by 7 digits
    if (/^\+947[0-9]{8}$/.test(cleaned)) return { valid: true, message: '' };
    // Landline: 0XX followed by 7 digits (e.g., 011 XXXXXXX)
    if (/^0[1-9][0-9]{8}$/.test(cleaned)) return { valid: true, message: '' };
    // Landline with +94
    if (/^\+94[1-9][0-9]{8}$/.test(cleaned)) return { valid: true, message: '' };
    return { valid: false, message: 'Enter a valid Sri Lankan number (e.g., 07X XXXXXXX)' };
};

const validateTitle = (title) => {
    if (!title || title.trim() === '') return { valid: false, message: 'Item title is required' };
    if (title.trim().length < 3) return { valid: false, message: 'Title must be at least 3 characters' };
    if (title.trim().length > 100) return { valid: false, message: 'Title must be under 100 characters' };
    return { valid: true, message: '' };
};

const validateLocation = (location) => {
    if (!location || location.trim() === '') return { valid: false, message: 'Location is required' };
    if (location.trim().length < 3) return { valid: false, message: 'Location must be at least 3 characters' };
    return { valid: true, message: '' };
};

const validateDescription = (desc, type) => {
    if (type === 'lost') {
        if (!desc || desc.trim() === '') return { valid: false, message: 'Description is required for lost items' };
        if (desc.trim().length < 10) return { valid: false, message: 'Description must be at least 10 characters' };
    }
    return { valid: true, message: '' };
};

export default function ReportForm({
    isEditing,
    formType, setFormType,
    formTitle, setFormTitle,
    formLocation, setFormLocation,
    formDesc, setFormDesc,
    formPhone, setFormPhone,
    formImage,
    isLoading,
    vaultItems,
    onPickImage,
    onSelectFromVault,
    onOpenVault,
    onPublish,
    onClose,
}) {
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const shakeAnim = React.useRef(new Animated.Value(0)).current;

    // Revalidate on field change if already touched
    useEffect(() => {
        if (touched.title) {
            setErrors(prev => ({ ...prev, title: validateTitle(formTitle).message }));
        }
    }, [formTitle]);

    useEffect(() => {
        if (touched.location) {
            setErrors(prev => ({ ...prev, location: validateLocation(formLocation).message }));
        }
    }, [formLocation]);

    useEffect(() => {
        if (touched.desc) {
            setErrors(prev => ({ ...prev, desc: validateDescription(formDesc, formType).message }));
        }
    }, [formDesc, formType]);

    useEffect(() => {
        if (touched.phone) {
            setErrors(prev => ({ ...prev, phone: validateSLPhone(formPhone).message }));
        }
    }, [formPhone]);

    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const handlePublish = () => {
        const titleResult = validateTitle(formTitle);
        const locationResult = validateLocation(formLocation);
        const descResult = validateDescription(formDesc, formType);
        const phoneResult = validateSLPhone(formPhone);

        const newErrors = {
            title: titleResult.message,
            location: locationResult.message,
            desc: descResult.message,
            phone: phoneResult.message,
        };

        setErrors(newErrors);
        setTouched({ title: true, location: true, desc: true, phone: true });

        const hasErrors = Object.values(newErrors).some(e => e !== '');
        if (hasErrors) {
            triggerShake();
            return;
        }

        onPublish();
    };

    const renderFieldError = (field) => {
        if (!errors[field]) return null;
        return (
            <Animated.View style={[styles.errorContainer, { transform: [{ translateX: shakeAnim }] }]}>
                <Ionicons name="alert-circle" size={14} color={theme.colors.danger} />
                <Text style={styles.errorText}>{errors[field]}</Text>
            </Animated.View>
        );
    };

    return (
        <ScrollView 
            style={styles.formContainer} 
            contentContainerStyle={{ paddingBottom: 60 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {/* Form Top Bar */}
            <View style={styles.formTopBar}>
                <TouchableOpacity onPress={onClose} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                    <Text style={styles.formTopTitle}>
                        {isEditing ? '← Lost & Found' : 'Report Lost Item'}
                    </Text>
                </TouchableOpacity>
                <View style={{ width: 36 }} />
            </View>

            {/* Form Header */}
            <View style={styles.formHeaderRow}>
                <Text style={styles.formMainTitle}>{isEditing ? 'Edit Details' : 'Discovery Details'}</Text>
                <View style={styles.stepBadge}>
                    <Text style={styles.formStepText}>{isEditing ? 'EDITING' : 'STEP 01'}</Text>
                </View>
            </View>

            {/* Form Type Toggle */}
            <View style={styles.formToggleContainer}>
                <TouchableOpacity 
                    style={[styles.formToggleBtn, formType === 'lost' && styles.formToggleBtnActiveBlue]}
                    onPress={() => setFormType('lost')}
                >
                    <Ionicons name="search-outline" size={18} color={formType === 'lost' ? '#FFF' : theme.colors.textSub} />
                    <Text style={[styles.formToggleText, { color: formType === 'lost' ? '#FFF' : theme.colors.textSub }]}> I Lost It</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.formToggleBtn, formType === 'found' && styles.formToggleBtnActiveGreen]}
                    onPress={() => setFormType('found')}
                >
                    <Ionicons name="hand-right-outline" size={18} color={formType === 'found' ? '#FFF' : theme.colors.textSub} />
                    <Text style={[styles.formToggleText, { color: formType === 'found' ? '#FFF' : theme.colors.textSub }]}> I Found It</Text>
                </TouchableOpacity>
            </View>

            {/* Visual Identity */}
            <Text style={styles.formSectionLabel}>VISUAL IDENTITY</Text>
            <TouchableOpacity style={styles.uploadContainer} onPress={onPickImage}>
                {formImage ? (
                    <Image source={{ uri: formImage }} style={styles.uploadedImagePreview} />
                ) : (
                    <>
                        <View style={styles.cameraIconWrapper}>
                            <Ionicons name="camera" size={28} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.uploadTitle}>Capture or Upload Photo</Text>
                        <Text style={styles.uploadSub}>Recommended for faster identification</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* From My Vault - Only show if lost */}
            {formType === 'lost' && (
                <>
                    <View style={styles.vaultHeaderRow}>
                        <Text style={styles.formSectionLabel}>FROM MY VAULT</Text>
                        <TouchableOpacity onPress={onOpenVault}>
                            <Text style={styles.manageVaultText}>Manage Vault <Ionicons name="open-outline" size={12} /></Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vaultScroll}>
                        {vaultItems.length === 0 ? (
                            <Text style={styles.emptyVaultText}>Your vault is empty.</Text>
                        ) : (
                            vaultItems.map((item) => (
                                <TouchableOpacity 
                                    key={item._id} 
                                    style={styles.vaultCard}
                                    onPress={() => onSelectFromVault(item)}
                                >
                                    <Image source={{ uri: item.image }} style={styles.vaultCardImage} />
                                    <View style={styles.vaultCardContentWrapper}>
                                        <Text style={styles.vaultCardTitle} numberOfLines={1}>{item.title}</Text>
                                        <Text style={styles.vaultCardSub} numberOfLines={1}>{item.subtext}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </>
            )}

            {/* Item Title */}
            <Text style={styles.formSectionLabel}>ITEM TITLE <Text style={styles.requiredStar}>*</Text></Text>
            <View style={[styles.iconInputContainer, errors.title ? styles.inputError : null]}>
                <Ionicons name="pricetag" size={20} color={theme.colors.primary} style={{ marginRight: 10 }} />
                <TextInput 
                    style={styles.iconInput}
                    placeholder="e.g. Blue Backpack, MacBook Pro"
                    placeholderTextColor="#A1A5CD"
                    value={formTitle}
                    onChangeText={setFormTitle}
                    onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
                    maxLength={100}
                />
            </View>
            {renderFieldError('title')}

            {/* Location */}
            <Text style={styles.formSectionLabel}>
                {formType === 'lost' ? 'WHERE DID YOU LAST SEE IT?' : 'WHERE DID YOU FIND IT?'} <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={[styles.iconInputContainer, errors.location ? styles.inputError : null]}>
                <Ionicons name="location" size={20} color={theme.colors.primary} style={{ marginRight: 10 }} />
                <TextInput 
                    style={styles.iconInput}
                    placeholder="e.g. Main Library, 2nd Floor"
                    placeholderTextColor="#A1A5CD"
                    value={formLocation}
                    onChangeText={setFormLocation}
                    onBlur={() => setTouched(prev => ({ ...prev, location: true }))}
                />
            </View>
            {renderFieldError('location')}

            {/* Description */}
            <Text style={styles.formSectionLabel}>
                ITEM DESCRIPTION {formType === 'lost' ? <Text style={styles.requiredStar}>*</Text> : '(OPTIONAL)'}
            </Text>
            <TextInput 
                style={[styles.formTextArea, errors.desc ? styles.inputError : null]}
                placeholder="Describe unique markings, stickers, or brand names..."
                placeholderTextColor="#A1A5CD"
                multiline
                value={formDesc}
                onChangeText={setFormDesc}
                onBlur={() => setTouched(prev => ({ ...prev, desc: true }))}
            />
            {renderFieldError('desc')}

            {/* Phone Number */}
            <Text style={styles.formSectionLabel}>PHONE NUMBER <Text style={styles.requiredStar}>*</Text></Text>
            <View style={[styles.phoneInputContainer, errors.phone ? styles.inputError : null]}>
                <View style={styles.phonePrefix}>
                    <Text style={styles.phonePrefixFlag}>🇱🇰</Text>
                    <Text style={styles.phonePrefixText}>+94</Text>
                </View>
                <TextInput 
                    style={styles.phoneInput}
                    placeholder="07X XXXXXXX"
                    placeholderTextColor="#A1A5CD"
                    keyboardType="phone-pad"
                    value={formPhone}
                    onChangeText={setFormPhone}
                    onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                    maxLength={15}
                />
            </View>
            {renderFieldError('phone')}

            {/* Submit */}
            <TouchableOpacity 
                style={[styles.publishBtn, isLoading && { opacity: 0.7 }]} 
                onPress={handlePublish}
                disabled={isLoading}
            >
                <Text style={styles.publishBtnText}>
                    {isLoading ? 'Processing...' : (isEditing ? 'Update Report' : 'Publish Report')}
                </Text>
                {!isLoading && <Ionicons name="send" size={18} color="#FFF" style={{ marginLeft: 8 }} />}
            </TouchableOpacity>
            <Text style={styles.disclaimerText}>By publishing, you agree to the Campus Safety guidelines.</Text>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    formContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    formTopBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formTopTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    formHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    formMainTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1E1B4B',
    },
    stepBadge: {
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    formStepText: {
        fontSize: 11,
        fontWeight: '800',
        color: theme.colors.primary,
        letterSpacing: 1,
    },
    formToggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#EBECEF',
        borderRadius: 30,
        padding: 4,
        marginBottom: 28,
    },
    formToggleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 26,
    },
    formToggleBtnActiveBlue: {
        backgroundColor: '#1D4ED8',
        shadowColor: '#1D4ED8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    formToggleBtnActiveGreen: {
        backgroundColor: '#059669',
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    formToggleText: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 8,
    },
    formSectionLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: theme.colors.primary,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    requiredStar: {
        color: theme.colors.danger,
        fontSize: 13,
        fontWeight: '900',
    },
    uploadContainer: {
        borderWidth: 2,
        borderColor: '#CBD5E1',
        borderStyle: 'dashed',
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        padding: 30,
        alignItems: 'center',
        marginBottom: 24,
    },
    cameraIconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#DBEAFE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    uploadTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E1B4B',
        marginBottom: 6,
    },
    uploadSub: {
        fontSize: 12,
        color: theme.colors.textSub,
    },
    uploadedImagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 14,
    },
    vaultHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    manageVaultText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    vaultScroll: {
        marginBottom: 24,
    },
    vaultCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        width: 140,
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
    vaultCardImage: {
        width: '100%',
        height: 70,
        backgroundColor: '#EBECEF',
    },
    vaultCardContentWrapper: {
        padding: 12,
    },
    vaultCardTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1E1B4B',
        marginBottom: 2,
    },
    vaultCardSub: {
        fontSize: 10,
        color: theme.colors.textSub,
    },
    emptyVaultText: {
        textAlign: 'center',
        color: theme.colors.textSub,
        fontStyle: 'italic',
        marginTop: 10,
    },
    iconInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0E7FF',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 6,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    inputError: {
        borderColor: theme.colors.danger,
        borderWidth: 2,
    },
    iconInput: {
        flex: 1,
        fontSize: 15,
        color: '#1E1B4B',
        fontWeight: '600',
    },
    formTextArea: {
        backgroundColor: '#E0E7FF',
        borderRadius: 12,
        padding: 16,
        height: 120,
        textAlignVertical: 'top',
        fontSize: 14,
        color: '#1E1B4B',
        fontWeight: '500',
        marginBottom: 6,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0E7FF',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 56,
        marginBottom: 6,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    phonePrefix: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#C7D2FE',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 10,
    },
    phonePrefixFlag: {
        fontSize: 16,
        marginRight: 4,
    },
    phonePrefixText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E1B4B',
    },
    phoneInput: {
        flex: 1,
        fontSize: 15,
        color: '#1E1B4B',
        fontWeight: '600',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        marginTop: 4,
        paddingLeft: 4,
    },
    errorText: {
        color: theme.colors.danger,
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
    publishBtn: {
        backgroundColor: '#4F46E5',
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
        marginBottom: 12,
        marginTop: 20,
    },
    publishBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    disclaimerText: {
        textAlign: 'center',
        fontSize: 11,
        color: theme.colors.textSub,
        fontStyle: 'italic',
    },
});
