import { useParams } from 'react-router-dom';

export const MemberProfile = () => {
    const { memberId } = useParams();

    return (
        <div className="h-full flex flex-col items-center justify-center text-white/70 gap-2">
            <div className="w-16 h-16 rounded-full bg-sky-600 flex items-center justify-center text-2xl font-semibold text-white">
                {memberId ? memberId.slice(-2).toUpperCase() : '?'}
            </div>
            <p className="text-sm">Direct messages with this member are coming soon.</p>
            <p className="text-xs text-white/40">Member ID: {memberId}</p>
        </div>
    );
};
