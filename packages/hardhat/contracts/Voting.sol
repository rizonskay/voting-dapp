// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    struct Proposal {
        string name;
        uint256 voteCount;
    }

    address public owner;
    bool public votingActive;

    mapping(address => bool) public canVote;
    mapping(address => bool) public hasVoted;

    Proposal[] private proposals;

    event VotingStarted(string[] proposalNames);
    event VotingStopped();
    event VoterAllowed(address voter);
    event Voted(address voter, uint256 proposalIndex);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier whenActive() {
        require(votingActive, "Voting not active");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function startVoting(string[] calldata proposalNames) external onlyOwner {
        require(!votingActive, "Already active");
        require(proposalNames.length >= 2, "Need 2+ proposals");

        // reset proposals
        delete proposals;

        for (uint256 i = 0; i < proposalNames.length; i++) {
            require(bytes(proposalNames[i]).length > 0, "Empty proposal");
            proposals.push(Proposal({ name: proposalNames[i], voteCount: 0 }));
        }

        votingActive = true;
        emit VotingStarted(proposalNames);
    }

    function stopVoting() external onlyOwner whenActive {
        votingActive = false;
        emit VotingStopped();
    }

    function allowVoter(address voter) external onlyOwner {
        require(voter != address(0), "Zero address");
        canVote[voter] = true;
        emit VoterAllowed(voter);
    }

    function vote(uint256 proposalIndex) external whenActive {
        require(canVote[msg.sender], "Not allowed");
        require(!hasVoted[msg.sender], "Already voted");
        require(proposalIndex < proposals.length, "Bad index");

        hasVoted[msg.sender] = true;
        proposals[proposalIndex].voteCount += 1;

        emit Voted(msg.sender, proposalIndex);
    }

    function proposalsCount() external view returns (uint256) {
        return proposals.length;
    }

    function getProposal(uint256 proposalIndex) external view returns (string memory name, uint256 voteCount) {
        require(proposalIndex < proposals.length, "Bad index");
        Proposal storage p = proposals[proposalIndex];
        return (p.name, p.voteCount);
    }

    function winner() external view returns (uint256 winnerIndex, string memory winnerName, uint256 winnerVotes) {
        require(proposals.length > 0, "No proposals");

        uint256 bestIndex = 0;
        uint256 bestVotes = proposals[0].voteCount;

        for (uint256 i = 1; i < proposals.length; i++) {
            if (proposals[i].voteCount > bestVotes) {
                bestVotes = proposals[i].voteCount;
                bestIndex = i;
            }
        }

        return (bestIndex, proposals[bestIndex].name, proposals[bestIndex].voteCount);
    }
}
