import { expect } from "chai";
import { ethers } from "hardhat";

describe("Voting", function () {
  it("Should deploy and set owner", async function () {
    const [owner] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();
    await voting.waitForDeployment();

    expect(await voting.owner()).to.equal(owner.address);
  });

  it("Owner can start voting and set proposals", async function () {
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();
    await voting.waitForDeployment();

    await voting.startVoting(["Alice", "Bob", "Charlie"]);

    expect(await voting.votingActive()).to.equal(true);
    expect(await voting.proposalsCount()).to.equal(3);

    const p1 = await voting.getProposal(1);
    expect(p1[0]).to.equal("Bob");
    expect(p1[1]).to.equal(0);
  });

  it("Allowed voter can vote once; winner updates", async function () {
    const [, voter] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();
    await voting.waitForDeployment();

    await voting.startVoting(["Alice", "Bob", "Charlie"]);
    await voting.allowVoter(voter.address);

    await voting.connect(voter).vote(1);

    expect(await voting.hasVoted(voter.address)).to.equal(true);

    const p1 = await voting.getProposal(1);
    expect(p1[1]).to.equal(1);

    const w = await voting.winner();
    expect(w[0]).to.equal(1);
    expect(w[1]).to.equal("Bob");

    await expect(voting.connect(voter).vote(1)).to.be.revertedWith("Already voted");
  });

  it("Non-owner cannot allow voters", async function () {
    const [, notOwner] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();
    await voting.waitForDeployment();

    await expect(voting.connect(notOwner).allowVoter(notOwner.address)).to.be.revertedWith("Only owner");
  });
});
