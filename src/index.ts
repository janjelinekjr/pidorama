import { downloadAndExtractGTFS } from './download';

(async () => {
    try {
        await downloadAndExtractGTFS();
        // will be import to db
        console.log('✅ All done!');
    } catch (err) {
        console.error('❌ Error:', err);
    }
})();