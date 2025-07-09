// Debug script để test API vaccination plans sau khi confirm
console.log('🔍 Debugging vaccination plans API after confirmation...\n');

const studentId = 101; // Thay đổi thành studentId thực tế

async function debugVaccinationPlans() {
  try {
    console.log(`📋 Fetching vaccination plans for student ${studentId}...`);
    
    const response = await fetch(`https://medical-backend-production.up.railway.app/vaccination-plans/students/${studentId}`);
    const data = await response.json();
    
    console.log('\n📊 Current vaccination plans:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n📌 Status breakdown:');
    data.forEach((plan, index) => {
      console.log(`${index + 1}. Plan ID ${plan.id}: "${plan.name}" - Status: ${plan.status}`);
      if (plan.status === 'WAITING_PARENT') {
        console.log(`   ⚠️  Still waiting for parent confirmation!`);
        console.log(`   📋 Notification Recipient ID: ${plan.notificationRecipientId}`);
      } else if (plan.status === 'COMPLETED') {
        console.log(`   ✅ Completed - no form should show`);
      }
    });
    
    const waitingPlans = data.filter(plan => plan.status === 'WAITING_PARENT');
    console.log(`\n🎯 Summary: ${waitingPlans.length} plans still waiting for parent confirmation`);
    
    if (waitingPlans.length > 0) {
      console.log('\n❗ These plans should show confirmation form:');
      waitingPlans.forEach(plan => {
        console.log(`   - ${plan.name} (ID: ${plan.id})`);
      });
    } else {
      console.log('\n✅ No plans waiting - no confirmation forms should show');
    }
    
  } catch (error) {
    console.error('❌ Error fetching plans:', error);
  }
}

debugVaccinationPlans();
