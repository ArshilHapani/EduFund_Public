import {
  CampaignCreated as CampaignCreatedEvent,
  CampaignMadeInactive as CampaignMadeInactiveEvent,
  CampaignVoted as CampaignVotedEvent,
  DonationReceived as DonationReceivedEvent,
  TransactionExecuted as TransactionExecutedEvent,
  TransactionProposed as TransactionProposedEvent
} from "../generated/EduFund/EduFund"
import {
  CampaignCreated,
  CampaignMadeInactive,
  CampaignVoted,
  DonationReceived,
  TransactionExecuted,
  TransactionProposed
} from "../generated/schema"

export function handleCampaignCreated(event: CampaignCreatedEvent): void {
  let entity = new CampaignCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.campaignId = event.params.campaignId
  entity.title = event.params.title
  entity.description = event.params.description
  entity.goal = event.params.goal
  entity.deadline = event.params.deadline

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCampaignMadeInactive(
  event: CampaignMadeInactiveEvent
): void {
  let entity = new CampaignMadeInactive(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.campaignId = event.params.campaignId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCampaignVoted(event: CampaignVotedEvent): void {
  let entity = new CampaignVoted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.voter = event.params.voter
  entity.campaignId = event.params.campaignId
  entity.transactionIndex = event.params.transactionIndex
  entity.vote = event.params.vote

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDonationReceived(event: DonationReceivedEvent): void {
  let entity = new DonationReceived(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.donor = event.params.donor
  entity.amount = event.params.amount
  entity.campaignId = event.params.campaignId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransactionExecuted(
  event: TransactionExecutedEvent
): void {
  let entity = new TransactionExecuted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.campaignId = event.params.campaignId
  entity.transactionIndex = event.params.transactionIndex

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransactionProposed(
  event: TransactionProposedEvent
): void {
  let entity = new TransactionProposed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.campaignId = event.params.campaignId
  entity.recipients = event.params.recipients
  entity.amounts = event.params.amounts
  entity.descriptions = event.params.descriptions

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
