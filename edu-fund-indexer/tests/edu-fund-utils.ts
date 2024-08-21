import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  CampaignCreated,
  CampaignMadeInactive,
  CampaignVoted,
  DonationReceived,
  TransactionExecuted,
  TransactionProposed
} from "../generated/EduFund/EduFund"

export function createCampaignCreatedEvent(
  owner: Address,
  campaignId: BigInt,
  title: string,
  description: string,
  goal: BigInt,
  deadline: BigInt
): CampaignCreated {
  let campaignCreatedEvent = changetype<CampaignCreated>(newMockEvent())

  campaignCreatedEvent.parameters = new Array()

  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "campaignId",
      ethereum.Value.fromUnsignedBigInt(campaignId)
    )
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam("title", ethereum.Value.fromString(title))
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "description",
      ethereum.Value.fromString(description)
    )
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam("goal", ethereum.Value.fromUnsignedBigInt(goal))
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "deadline",
      ethereum.Value.fromUnsignedBigInt(deadline)
    )
  )

  return campaignCreatedEvent
}

export function createCampaignMadeInactiveEvent(
  campaignId: BigInt
): CampaignMadeInactive {
  let campaignMadeInactiveEvent = changetype<CampaignMadeInactive>(
    newMockEvent()
  )

  campaignMadeInactiveEvent.parameters = new Array()

  campaignMadeInactiveEvent.parameters.push(
    new ethereum.EventParam(
      "campaignId",
      ethereum.Value.fromUnsignedBigInt(campaignId)
    )
  )

  return campaignMadeInactiveEvent
}

export function createCampaignVotedEvent(
  voter: Address,
  campaignId: BigInt,
  transactionIndex: BigInt,
  vote: boolean
): CampaignVoted {
  let campaignVotedEvent = changetype<CampaignVoted>(newMockEvent())

  campaignVotedEvent.parameters = new Array()

  campaignVotedEvent.parameters.push(
    new ethereum.EventParam("voter", ethereum.Value.fromAddress(voter))
  )
  campaignVotedEvent.parameters.push(
    new ethereum.EventParam(
      "campaignId",
      ethereum.Value.fromUnsignedBigInt(campaignId)
    )
  )
  campaignVotedEvent.parameters.push(
    new ethereum.EventParam(
      "transactionIndex",
      ethereum.Value.fromUnsignedBigInt(transactionIndex)
    )
  )
  campaignVotedEvent.parameters.push(
    new ethereum.EventParam("vote", ethereum.Value.fromBoolean(vote))
  )

  return campaignVotedEvent
}

export function createDonationReceivedEvent(
  donor: Address,
  amount: BigInt,
  campaignId: BigInt
): DonationReceived {
  let donationReceivedEvent = changetype<DonationReceived>(newMockEvent())

  donationReceivedEvent.parameters = new Array()

  donationReceivedEvent.parameters.push(
    new ethereum.EventParam("donor", ethereum.Value.fromAddress(donor))
  )
  donationReceivedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  donationReceivedEvent.parameters.push(
    new ethereum.EventParam(
      "campaignId",
      ethereum.Value.fromUnsignedBigInt(campaignId)
    )
  )

  return donationReceivedEvent
}

export function createTransactionExecutedEvent(
  campaignId: BigInt,
  transactionIndex: BigInt
): TransactionExecuted {
  let transactionExecutedEvent = changetype<TransactionExecuted>(newMockEvent())

  transactionExecutedEvent.parameters = new Array()

  transactionExecutedEvent.parameters.push(
    new ethereum.EventParam(
      "campaignId",
      ethereum.Value.fromUnsignedBigInt(campaignId)
    )
  )
  transactionExecutedEvent.parameters.push(
    new ethereum.EventParam(
      "transactionIndex",
      ethereum.Value.fromUnsignedBigInt(transactionIndex)
    )
  )

  return transactionExecutedEvent
}

export function createTransactionProposedEvent(
  owner: Address,
  campaignId: BigInt,
  recipients: Array<Address>,
  amounts: Array<BigInt>,
  descriptions: Array<string>
): TransactionProposed {
  let transactionProposedEvent = changetype<TransactionProposed>(newMockEvent())

  transactionProposedEvent.parameters = new Array()

  transactionProposedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  transactionProposedEvent.parameters.push(
    new ethereum.EventParam(
      "campaignId",
      ethereum.Value.fromUnsignedBigInt(campaignId)
    )
  )
  transactionProposedEvent.parameters.push(
    new ethereum.EventParam(
      "recipients",
      ethereum.Value.fromAddressArray(recipients)
    )
  )
  transactionProposedEvent.parameters.push(
    new ethereum.EventParam(
      "amounts",
      ethereum.Value.fromUnsignedBigIntArray(amounts)
    )
  )
  transactionProposedEvent.parameters.push(
    new ethereum.EventParam(
      "descriptions",
      ethereum.Value.fromStringArray(descriptions)
    )
  )

  return transactionProposedEvent
}
