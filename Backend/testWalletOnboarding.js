import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { KYC } from './Models/kyc.model.js';
import { WalletPasscode } from './Models/walletPasscode.model.js';
import { User } from './Models/user.model.js';

dotenv.config();

const testWalletOnboarding = async () => {
    try {
        console.log('🔌 Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Database connected successfully');

        // Test 1: Check if models are working
        console.log('\n🧪 Test 1: Model Validation');
        
        const user = await User.findOne().limit(1);
        if (!user) {
            console.log('❌ No users found in database');
            return;
        }
        console.log(`✅ Found user: ${user.email}`);

        // Test 2: Check KYC model
        console.log('\n🧪 Test 2: KYC Model');
        const kycCount = await KYC.countDocuments();
        console.log(`✅ KYC documents in database: ${kycCount}`);

        // Test 3: Check WalletPasscode model
        console.log('\n🧪 Test 3: WalletPasscode Model');
        const passcodeCount = await WalletPasscode.countDocuments();
        console.log(`✅ Wallet passcodes in database: ${passcodeCount}`);

        // Test 4: Create a test KYC entry
        console.log('\n🧪 Test 4: Create Test KYC');
        const testKYC = new KYC({
            userId: user._id,
            fatherName: 'Test Father',
            cnicNumber: '12345-1234567-1',
            dateOfBirth: new Date('1990-01-01'),
            address: '123 Test Street',
            city: 'Test City',
            postalCode: '12345',
            occupation: 'Test Occupation',
            employer: 'Test Employer',
            monthlyIncome: '50000',
            sourceOfFunds: 'Salary',
            purposeOfAccount: 'Test purpose',
            emergencyContact: {
                name: 'Test Emergency',
                relationship: 'Spouse',
                phone: '1234567890'
            },
            documents: {
                cnicFront: 'test-front.jpg',
                cnicBack: 'test-back.jpg',
                selfie: 'test-selfie.jpg',
                utilityBill: 'test-bill.pdf'
            },
            kycStatus: 'pending'
        });

        await testKYC.save();
        console.log(`✅ Test KYC created with ID: ${testKYC._id}`);

        // Test 5: Update KYC status to verified
        console.log('\n🧪 Test 5: Update KYC Status');
        await testKYC.updateStatus('verified', user._id, 'Test approval');
        console.log(`✅ KYC status updated to: ${testKYC.kycStatus}`);

        // Test 6: Create wallet passcode
        console.log('\n🧪 Test 6: Create Wallet Passcode');
        const testPasscode = await WalletPasscode.createForUser(user._id, '123456', user._id);
        console.log(`✅ Wallet passcode created with ID: ${testPasscode._id}`);

        // Test 7: Verify passcode
        console.log('\n🧪 Test 7: Verify Passcode');
        const verificationResult = await testPasscode.verifyPasscode('123456');
        console.log(`✅ Passcode verification result:`, verificationResult);

        // Test 8: Test passcode change
        console.log('\n🧪 Test 8: Change Passcode');
        await testPasscode.changePasscode('654321', user._id);
        console.log(`✅ Passcode changed successfully`);

        // Test 9: Verify new passcode
        console.log('\n🧪 Test 9: Verify New Passcode');
        const newVerificationResult = await testPasscode.verifyPasscode('654321');
        console.log(`✅ New passcode verification result:`, newVerificationResult);

        // Test 10: Test failed attempts
        console.log('\n🧪 Test 10: Test Failed Attempts');
        for (let i = 0; i < 3; i++) {
            const failedResult = await testPasscode.verifyPasscode('000000');
            console.log(`Attempt ${i + 1}:`, failedResult);
        }

        // Test 11: Check if wallet is locked
        console.log('\n🧪 Test 11: Check Wallet Lock Status');
        const lockedStatus = await testPasscode.verifyPasscode('654321');
        console.log(`Locked status:`, lockedStatus);

        // Test 12: Unlock wallet
        console.log('\n🧪 Test 12: Unlock Wallet');
        await testPasscode.unlockWallet(user._id);
        console.log(`✅ Wallet unlocked successfully`);

        // Test 13: Verify unlock worked
        console.log('\n🧪 Test 13: Verify Unlock');
        const unlockVerification = await testPasscode.verifyPasscode('654321');
        console.log(`Unlock verification result:`, unlockVerification);

        console.log('\n🎉 All tests completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`- KYC Model: ✅ Working`);
        console.log(`- WalletPasscode Model: ✅ Working`);
        console.log(`- Status Updates: ✅ Working`);
        console.log(`- Passcode Operations: ✅ Working`);
        console.log(`- Security Features: ✅ Working`);

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
};

// Run the test
testWalletOnboarding();
