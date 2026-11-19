import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

function clientError(message: string, status = 400) {
  return Object.assign(new Error(message), { status });
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null;
}

export async function createActivity(input: unknown) {
  if (!isRecord(input) || typeof input.userId !== 'string' || typeof input.teamId !== 'string' || typeof input.type !== 'string' || typeof input.minutes !== 'number' || !input.type.trim() || input.minutes <= 0) {
    throw clientError('userId, teamId, type, and positive minutes are required');
  }
  if (!User.db.base.Types.ObjectId.isValid(input.userId) || !User.db.base.Types.ObjectId.isValid(input.teamId)) {
    throw clientError('userId and teamId must be valid IDs');
  }
  const [user, team] = await Promise.all([User.findById(input.userId), Team.findById(input.teamId)]);
  if (!user || !team) throw clientError('userId and teamId must reference existing records', 404);
  return Activity.create({
    user: user._id,
    team: team._id,
    type: input.type.trim(),
    minutes: input.minutes,
    points: input.minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input) || typeof input.name !== 'string' || !input.name.trim()) {
    throw clientError('name is required');
  }
  if (input.members !== undefined && (!Array.isArray(input.members) || input.members.some((member) => typeof member !== 'string' || !User.db.base.Types.ObjectId.isValid(member)))) {
    throw clientError('members must contain valid IDs');
  }
  return Team.create({
    name: input.name.trim(),
    mascot: typeof input.mascot === 'string' ? input.mascot : undefined,
    members: input.members,
  });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().lean(),
    Activity.aggregate<{ _id: unknown; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const totalsByTeam = new Map(totals.map((total) => [String(total._id), total.totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: totalsByTeam.get(String(team._id)) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw clientError('user not found', 404);
  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const focus = user.fitnessGoal || recentActivity?.type;
  const workouts = await Workout.find(focus ? { focus } : {}).lean();
  const fallback = workouts.length > 0 ? workouts : await Workout.find().lean();
  return fallback.map((workout) => ({
    ...workout,
    reason: recentActivity ? `Matches your ${focus} goal and recent ${recentActivity.type} activity.` : `Matches your ${focus} goal.`,
  }));
}

export { User };
