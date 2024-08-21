import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

import {
  CampaignCreated as CampaignCreatedEvent,
  CampaignMadeInactive as CampaignMadeInactiveEvent,
  CampaignVoted as CampaignVotedEvent,
  DonationReceived as DonationReceivedEvent,
  TransactionExecuted as TransactionExecutedEvent,
  TransactionProposed as TransactionProposedEvent,
} from "../generated/EduFund/EduFund";
import {
  Campaign,
  CampaignVoter,
  CampaignVotes,
  Donation,
  Transaction,
} from "../generated/schema";

export function handleCampaignCreated(event: CampaignCreatedEvent): void {
  let campaignRecord = new Campaign(event.params.campaignId.toString());

  campaignRecord.owner = Bytes.fromHexString(event.params.owner.toHexString());
  campaignRecord.title = event.params.title;
  campaignRecord.description = event.params.description;
  campaignRecord.goal = event.params.goal;
  campaignRecord.balance = BigInt.fromString("0");
  campaignRecord.deadline = event.params.deadline;
  campaignRecord.active = true;
  campaignRecord.isTransactionProposed = false;
  campaignRecord.isTransactionExecuted = false;
  campaignRecord.save();
}

export function handleCampaignVoted(event: CampaignVotedEvent): void {
  let campaignVoter = new CampaignVoter(
    event.transaction.hash
      .concatI32(event.logIndex.toI32())
      .concat(event.transaction.from)
  );

  campaignVoter.campaignId = event.params.campaignId;
  campaignVoter.voter = event.transaction.from;
  campaignVoter.vote = event.params.vote;

  let campaignVotes = CampaignVotes.load(event.params.campaignId.toString());

  if (!campaignVotes) {
    campaignVotes = new CampaignVotes(event.params.campaignId.toString());
    if (event.params.vote) {
      campaignVotes.yesVotes = BigInt.fromI32(1);
      campaignVotes.noVotes = BigInt.fromI32(0);
    } else {
      campaignVotes.noVotes = BigInt.fromI32(1);
      campaignVotes.yesVotes = BigInt.fromI32(0);
    }
  } else {
    if (event.params.vote) {
      campaignVotes.yesVotes = campaignVotes.yesVotes.plus(BigInt.fromI32(1));
    } else {
      campaignVotes.noVotes = campaignVotes.noVotes.plus(BigInt.fromI32(1));
    }
  }

  campaignVotes.save();
}

export function handleDonationReceived(event: DonationReceivedEvent): void {
  let entity = new Donation(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  let campaignRecord = Campaign.load(event.params.campaignId.toString());
  if (!campaignRecord) return;

  campaignRecord.balance = campaignRecord.balance.plus(event.params.amount);
  if (campaignRecord.balance >= campaignRecord.goal) {
    campaignRecord.active = false;
  }

  entity.donor = Bytes.fromHexString(event.params.donor.toHexString());
  entity.campaignId = event.params.campaignId;
  entity.amount = event.params.amount;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
  campaignRecord.save();
}

export function handleTransactionExecuted(
  event: TransactionExecutedEvent
): void {
  let campaignRecord = Campaign.load(event.params.campaignId.toString());
  if (!campaignRecord) return;
  campaignRecord.isTransactionExecuted = true;
}

export function handleTransactionProposed(
  event: TransactionProposedEvent
): void {
  let entity = new Transaction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  let campaignRecord = Campaign.load(event.params.campaignId.toString());
  if (!campaignRecord) return;
  campaignRecord.isTransactionProposed = true;

  entity.campaignId = event.params.campaignId;
  entity.recipients = event.params.recipients.map<Bytes>((r: Address) =>
    Bytes.fromHexString(r.toHexString())
  );
  entity.amounts = event.params.amounts;
  entity.descriptions = event.params.descriptions;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
  campaignRecord.save();
}
export function handleCampaignMadeInactive(
  event: CampaignMadeInactiveEvent
): void {
  let campaignRecord = Campaign.load(event.params.campaignId.toString());
  if (!campaignRecord) return;
  campaignRecord.active = false;
  campaignRecord.save();
}
