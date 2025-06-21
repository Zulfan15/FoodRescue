'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  MapPin,
  Shield,
  Eye,
  Moon,
  Sun,
  Globe,
  Smartphone,
  Mail,
  Lock,
  Heart,
  Filter,
  Trash2,
  Download,
  Upload,
  ChevronRight,
  Check,
  X,
  AlertTriangle,
  Info
} from 'lucide-react'
import Link from 'next/link'

interface UserSettings {
  // Profile Settings
  profileVisibility: 'public' | 'private' | 'friends'
  showRealName: boolean
  showContactInfo: boolean
  
  // Notification Settings
  emailNotifications: {
    newDonations: boolean
    reservationUpdates: boolean
    pickupReminders: boolean
    systemUpdates: boolean
    marketing: boolean
  }
  pushNotifications: {
    newDonations: boolean
    reservationUpdates: boolean
    pickupReminders: boolean
    urgentAlerts: boolean
  }
  
  // Location & Privacy
  shareLocation: boolean
  locationRadius: number // in km
  autoLocation: boolean
  
  // Preferences
  language: 'en' | 'id'
  theme: 'light' | 'dark' | 'system'
  currency: 'IDR' | 'USD'
  timezone: string
  
  // Food Preferences
  dietaryRestrictions: string[]
  preferredCategories: string[]
  excludeExpired: boolean
  minRating: number
    // Security
  twoFactorAuth: boolean
  sessionTimeout: number // in minutes
  dataRetention: number // in days
}

const dietaryOptions = [
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Soy-Free',
  'Seafood-Free',
  'No Pork',
  'No Beef',
  'Organic Only'
]

const foodCategories = [
  'VEGETABLES',
  'FRUITS',
  'GRAINS',
  'PROTEINS',
  'DAIRY',
  'BEVERAGES',
  'PREPARED_MEALS',
  'BAKED_GOODS',
  'SNACKS',
  'FROZEN_FOODS',
  'CANNED_GOODS',
  'CONDIMENTS'
]

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState<UserSettings>({
    profileVisibility: 'public',
    showRealName: true,
    showContactInfo: false,
    emailNotifications: {
      newDonations: true,
      reservationUpdates: true,
      pickupReminders: true,
      systemUpdates: true,
      marketing: false
    },
    pushNotifications: {
      newDonations: true,
      reservationUpdates: true,
      pickupReminders: true,
      urgentAlerts: true
    },
    shareLocation: true,
    locationRadius: 5,
    autoLocation: true,
    language: 'id',
    theme: 'system',
    currency: 'IDR',
    timezone: 'Asia/Jakarta',
    dietaryRestrictions: [],
    preferredCategories: ['VEGETABLES', 'PREPARED_MEALS'],
    excludeExpired: true,
    minRating: 3,
    twoFactorAuth: false,
    sessionTimeout: 60,
    dataRetention: 90
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const tabs = [
    { id: 'profile', label: 'Profile & Privacy', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'location', label: 'Location & Map', icon: MapPin },
    { id: 'preferences', label: 'Food Preferences', icon: Heart },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Storage', icon: Download }
  ]

  const foodCategories = [
    'VEGETABLES', 'FRUITS', 'DAIRY', 'MEAT', 'GRAINS', 
    'PREPARED_MEALS', 'BAKERY', 'BEVERAGES', 'OTHERS'
  ]

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free', 
    'Dairy-Free', 'Nut-Free', 'Low-Sodium', 'Diabetic-Friendly'
  ]

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      loadUserSettings()
    }
  }, [user, isLoading, router])

  const loadUserSettings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/settings', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      if (response.ok) {
        const data = await response.json()
        setSettings({ ...settings, ...data.settings })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    setSaveStatus('saving')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ settings })
      })

      if (response.ok) {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (path: string, value: any) => {
    const keys = path.split('.')
    const newSettings = { ...settings }
    let current: any = newSettings

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value

    setSettings(newSettings)
  }
  const toggleArrayItem = (path: string, item: string) => {
    const currentArray = path.split('.').reduce((obj: any, key) => obj[key], settings) as string[]
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item]
    updateSetting(path, newArray)
  }

  const exportData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/export', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `foodrescue-data-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const deleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/user/delete', {
          method: 'DELETE',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })

        if (response.ok) {
          localStorage.removeItem('token')
          router.push('/')
        }
      } catch (error) {
        console.error('Error deleting account:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <SettingsIcon className="h-8 w-8 text-green-500 mr-3" />
                Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your account preferences and privacy settings
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {saveStatus === 'saved' && (
                <div className="flex items-center text-green-600 text-sm">
                  <Check className="h-4 w-4 mr-1" />
                  Saved
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center text-red-600 text-sm">
                  <X className="h-4 w-4 mr-1" />
                  Error saving
                </div>
              )}
              <button
                onClick={saveSettings}
                disabled={isSaving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                ) : null}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.label}
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Profile & Privacy Settings */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile & Privacy</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Profile Visibility
                      </label>
                      <div className="space-y-2">                        {['public', 'private', 'friends'].map((option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value={option}
                              checked={settings.profileVisibility === option}
                              onChange={(e) => updateSetting('profileVisibility', e.target.value)}
                              className="mr-3 text-green-600 focus:ring-green-500"
                            />
                            <span className="capitalize text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium text-gray-900">Show Real Name</p>
                        <p className="text-sm text-gray-500">Display your real name on your profile</p>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.showRealName}
                          onChange={(e) => updateSetting('showRealName', e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.showRealName ? 'bg-green-600' : 'bg-gray-200'
                        }`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.showRealName ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium text-gray-900">Show Contact Information</p>
                        <p className="text-sm text-gray-500">Allow other users to see your contact details</p>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.showContactInfo}
                          onChange={(e) => updateSetting('showContactInfo', e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.showContactInfo ? 'bg-green-600' : 'bg-gray-200'
                        }`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.showContactInfo ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Mail className="h-5 w-5 mr-2" />
                        Email Notifications
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(settings.emailNotifications).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between py-2">
                            <div>
                              <p className="font-medium text-gray-900">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </p>
                            </div>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => updateSetting(`emailNotifications.${key}`, e.target.checked)}
                                className="sr-only"
                              />
                              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                value ? 'bg-green-600' : 'bg-gray-200'
                              }`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  value ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Smartphone className="h-5 w-5 mr-2" />
                        Push Notifications
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(settings.pushNotifications).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between py-2">
                            <div>
                              <p className="font-medium text-gray-900">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </p>
                            </div>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => updateSetting(`pushNotifications.${key}`, e.target.checked)}
                                className="sr-only"
                              />
                              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                value ? 'bg-green-600' : 'bg-gray-200'
                              }`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  value ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Settings */}
              {activeTab === 'location' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Location & Map Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium text-gray-900">Share Location</p>
                        <p className="text-sm text-gray-500">Allow the app to access your location for better matching</p>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.shareLocation}
                          onChange={(e) => updateSetting('shareLocation', e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.shareLocation ? 'bg-green-600' : 'bg-gray-200'
                        }`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.shareLocation ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Search Radius (km)
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="1"
                          max="25"
                          value={settings.locationRadius}
                          onChange={(e) => updateSetting('locationRadius', parseInt(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                          {settings.locationRadius} km
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Show food donations within this radius from your location
                      </p>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium text-gray-900">Auto-detect Location</p>
                        <p className="text-sm text-gray-500">Automatically update your location when you move</p>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoLocation}
                          onChange={(e) => updateSetting('autoLocation', e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.autoLocation ? 'bg-green-600' : 'bg-gray-200'
                        }`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.autoLocation ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Food Preferences */}
              {activeTab === 'preferences' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Food Preferences</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Dietary Restrictions
                      </label>                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {dietaryOptions.map((option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.dietaryRestrictions.includes(option)}
                              onChange={() => toggleArrayItem('dietaryRestrictions', option)}
                              className="mr-2 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Preferred Food Categories
                      </label>                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {foodCategories.map((category) => (
                          <label key={category} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={settings.preferredCategories.includes(category)}
                              onChange={() => toggleArrayItem('preferredCategories', category)}
                              className="mr-2 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-900">{category.replace('_', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium text-gray-900">Exclude Expired Items</p>
                        <p className="text-sm text-gray-500">Hide donations that have already expired</p>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.excludeExpired}
                          onChange={(e) => updateSetting('excludeExpired', e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.excludeExpired ? 'bg-green-600' : 'bg-gray-200'
                        }`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.excludeExpired ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Minimum Donor Rating
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={settings.minRating}
                          onChange={(e) => updateSetting('minRating', parseInt(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                          {settings.minRating} ⭐
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.twoFactorAuth}
                            onChange={(e) => updateSetting('twoFactorAuth', e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.twoFactorAuth ? 'bg-green-600' : 'bg-gray-200'
                          }`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                        </label>
                        {settings.twoFactorAuth && (
                          <button className="text-sm text-green-600 hover:text-green-700">
                            Configure
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Session Timeout (minutes)
                      </label>                      <select
                        value={settings.sessionTimeout}
                        onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      >
                        <option value={15} className="text-gray-900">15 minutes</option>
                        <option value={30} className="text-gray-900">30 minutes</option>
                        <option value={60} className="text-gray-900">1 hour</option>
                        <option value={120} className="text-gray-900">2 hours</option>
                        <option value={480} className="text-gray-900">8 hours</option>
                        <option value={1440} className="text-gray-900">24 hours</option>
                      </select>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800">Password Security</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Last changed 30 days ago. Consider updating your password regularly.
                          </p>
                          <Link
                            href="/profile?tab=security"
                            className="text-sm text-yellow-800 hover:text-yellow-900 font-medium"
                          >
                            Change Password →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data & Storage */}
              {activeTab === 'data' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Data & Storage</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Data Export</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                          <div className="flex-1">
                            <p className="text-sm text-blue-800">
                              Download a copy of your data including donations, reservations, and profile information.
                            </p>
                            <button
                              onClick={exportData}
                              className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export My Data
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Data Retention Period
                      </label>
                      <select
                        value={settings.dataRetention}
                        onChange={(e) => updateSetting('dataRetention', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value={30}>30 days</option>
                        <option value={90}>90 days</option>
                        <option value={180}>6 months</option>
                        <option value={365}>1 year</option>
                        <option value={1095}>3 years</option>
                      </select>
                      <p className="text-sm text-gray-500 mt-2">
                        How long to keep your data after account deletion
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 text-red-600">Danger Zone</h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-red-800">Delete Account</h4>
                            <p className="text-sm text-red-700 mt-1">
                              Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                            <button
                              onClick={deleteAccount}
                              className="mt-3 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Account
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
