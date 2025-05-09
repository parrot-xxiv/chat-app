import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090');
pb.autoCancellation(process.env.NODE_ENV === 'production');

export default pb;
