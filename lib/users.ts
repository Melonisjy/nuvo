import { supabase } from "./supabase";

export async function getUserByNickname(nickname: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("nickname", nickname)
    .single();

  if (error) return null;
  return data;
}

export async function getUserByPrivyId(privyId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("privy_id", privyId)
    .single();

  if (error) return null;
  return data;
}

export async function createUser({
  privyId,
  nickname,
  walletAddress,
  email,
}: {
  privyId: string;
  nickname: string;
  walletAddress: string;
  email?: string;
}) {
  const { data, error } = await supabase
    .from("users")
    .insert({
      privy_id: privyId,
      nickname,
      wallet_address: walletAddress,
      email,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
