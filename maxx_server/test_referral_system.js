#!/usr/bin/env node

/**
 * Test script for the referral system
 * Run with: node test_referral_system.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import referralService from './src/services/referralService.js';

// Firebase config (you'll need to add your actual config)
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testReferralSystem() {
  console.log('🧪 Starting Referral System Tests...\n');

  try {
    // Test 1: Generate referral code
    console.log('Test 1: Generating referral code...');
    const generateResult = await referralService.generateReferralCode('test_user_1', 'test1@example.com');
    
    if (generateResult.success) {
      console.log('✅ Referral code generated:', generateResult.code);
    } else {
      console.log('❌ Failed to generate referral code:', generateResult.error);
      return;
    }

    // Test 2: Claim referral code
    console.log('\nTest 2: Claiming referral code...');
    const claimResult = await referralService.claimReferralCode(
      generateResult.code, 
      'test_user_2', 
      'test2@example.com'
    );
    
    if (claimResult.success) {
      console.log('✅ Referral code claimed successfully');
    } else {
      console.log('❌ Failed to claim referral code:', claimResult.error);
      return;
    }

    // Test 3: Get referral info
    console.log('\nTest 3: Getting referral info...');
    const infoResult = await referralService.getUserReferralInfo('test_user_1');
    
    if (infoResult.success) {
      console.log('✅ Referral info retrieved:', {
        code: infoResult.data.code,
        totalReferrals: infoResult.data.totalReferrals,
        pendingReferrals: infoResult.data.pendingReferrals
      });
    } else {
      console.log('❌ Failed to get referral info:', infoResult.error);
    }

    // Test 4: Qualify referral (simulate purchase)
    console.log('\nTest 4: Qualifying referral...');
    const qualifyResult = await referralService.qualifyReferral('test_user_2', {
      product_id: 'premium_monthly',
      purchase_date: new Date().toISOString(),
      amount: 9.99
    });
    
    if (qualifyResult.success) {
      console.log('✅ Referral qualified and reward created');
    } else {
      console.log('❌ Failed to qualify referral:', qualifyResult.error);
    }

    // Test 5: Get rewards
    console.log('\nTest 5: Getting user rewards...');
    const rewardsResult = await referralService.getUserRewards('test_user_1');
    
    if (rewardsResult.success) {
      console.log('✅ Rewards retrieved:', rewardsResult.data.length, 'rewards found');
    } else {
      console.log('❌ Failed to get rewards:', rewardsResult.error);
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Cleanup function to remove test data
async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    // Delete test referral codes
    const codesQuery = query(
      collection(db, 'referral_codes'),
      where('user_email', 'in', ['test1@example.com', 'test2@example.com'])
    );
    const codesSnapshot = await getDocs(codesQuery);
    
    for (const doc of codesSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Delete test referrals
    const referralsQuery = query(
      collection(db, 'referrals'),
      where('referred_user_email', 'in', ['test1@example.com', 'test2@example.com'])
    );
    const referralsSnapshot = await getDocs(referralsQuery);
    
    for (const doc of referralsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Delete test rewards
    const rewardsQuery = query(
      collection(db, 'rewards'),
      where('user_id', 'in', ['test_user_1', 'test_user_2'])
    );
    const rewardsSnapshot = await getDocs(rewardsQuery);
    
    for (const doc of rewardsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run tests
if (process.argv.includes('--cleanup')) {
  cleanup();
} else {
  testReferralSystem().then(() => {
    console.log('\n💡 Run with --cleanup to remove test data');
  });
}
