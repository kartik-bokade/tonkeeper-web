import { InfiniteData } from '@tanstack/react-query';
import { NftItemRepr } from '@tonkeeper/core/dist/tonApiV1';
import { AccountEvents } from '@tonkeeper/core/dist/tonApiV2';
import { TronEvents } from '@tonkeeper/core/dist/tronApi';
import React, { FC, useMemo, useState } from 'react';
import { GenericActivityGroup } from '../../state/activity';
import { MixedActivity, getMixedActivity } from '../../state/mixedActivity';
import { CoinHistorySkeleton, HistoryBlock, SkeletonList } from '../Skeleton';
import { NftNotification } from '../nft/NftNotification';
import { ActivityBlock } from './ActivityLayout';
import { ActionData, ActivityNotification } from './ActivityNotification';
import { TonActivityEvents } from './ton/TonActivityEvents';
import { TronActivityEvents } from './tron/TronActivityEvents';

export const ActivityList: FC<{
    isFetched: boolean;
    isFetchingNextPage: boolean;
    tonEvents?: InfiniteData<AccountEvents>;
    tronEvents?: InfiniteData<TronEvents>;
}> = ({ isFetched, isFetchingNextPage, tonEvents, tronEvents }) => {
    const activity = useMemo<GenericActivityGroup<MixedActivity>[]>(() => {
        return getMixedActivity(tonEvents, tronEvents);
    }, [tonEvents, tronEvents]);

    if (!isFetched) {
        return <CoinHistorySkeleton />;
    }
    return (
        <HistoryBlock>
            <MixedActivityGroup items={activity} />
            {isFetchingNextPage && <SkeletonList size={3} />}
        </HistoryBlock>
    );
};

export const MixedActivityGroup: FC<{
    items: GenericActivityGroup<MixedActivity>[];
}> = ({ items }) => {
    const [activity, setActivity] = useState<ActionData | undefined>(undefined);
    const [nft, setNft] = useState<NftItemRepr | undefined>(undefined);

    return (
        <>
            <ActivityBlock
                groups={items}
                RenderItem={({ event, date, timestamp }) => {
                    if (event.kind === 'tron') {
                        return (
                            <TronActivityEvents
                                event={event.event}
                                date={date}
                                timestamp={timestamp}
                            />
                        );
                    }
                    if (event.kind === 'ton') {
                        return (
                            <TonActivityEvents
                                event={event.event}
                                date={date}
                                timestamp={timestamp}
                                setActivity={setActivity}
                                setNft={setNft}
                            />
                        );
                    }
                    return <></>;
                }}
            />
            <ActivityNotification value={activity} handleClose={() => setActivity(undefined)} />
            <NftNotification nftItem={nft} handleClose={() => setNft(undefined)} />
        </>
    );
};
