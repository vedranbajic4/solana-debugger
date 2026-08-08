/* Function: sub_0x00120 @ 0x120 */

void sub_0x00120(uint64_t *input,int64_t param_2,uint64_t param_3,int64_t *param_4,
                     int64_t *param_5)

{
  bool is_valid_1;
  int64_t local_var_2;
  int64_t local_var_3;
  uint64_t local_uvar_4;
  uint64_t local_uvar_5;
  uint8_t *plocal_uvar_6;
  int64_t *plocal_var_7;
  uint64_t local_90;
  uint64_t local_88;
  int64_t local_80;
  uint64_t local_78;
  uint64_t local_70;
  uint64_t local_68;
  uint64_t local_60;
  uint64_t local_58;
  uint64_t local_50;
  uint64_t local_48;
  int64_t local_40;
  uint64_t local_38;
  int64_t local_30;
  uint64_t local_28;
  uint64_t local_20;
  uint64_t local_18;
  uint64_t local_10;
  uint8_t *local_8;
  
  plocal_var_7 = *(int64_t **)(param_2 + 0x18);
  if ((((*plocal_var_7 == 0) && (plocal_var_7[1] == 0)) && (plocal_var_7[2] == 0)) &&
     ((plocal_var_7[3] == 0 && (local_var_2 = sub_0x10f40(param_2), local_var_2 == 0)))) {
    sub_0x0eee8(&local_90,0xbc4);
    local_60 = local_90;
    local_58 = local_88;
LAB_ram_00000508:
    input[2] = local_58;
    input[1] = local_60;
    *input = 1;
    return;
  }
  if (((*plocal_var_7 != -0x1551fae7e59eb1dc) ||
      ((plocal_var_7[1] != 0x13ec1b160a58c0d2 || (plocal_var_7[2] != 0x5324a1627f4f8e29)))) ||
     (is_valid_1 = false, plocal_var_7[3] != 0x4a1ebeb5c53578dc)) {
    is_valid_1 = true;
  }
  if (is_valid_1) {
    sub_0x0eee8(&local_50,0xbbf);
    local_28 = plocal_var_7[3];
    local_30 = plocal_var_7[2];
    local_38 = plocal_var_7[1];
    local_40 = *plocal_var_7;
    local_20 = 0xeaae05181a614e24;
    local_18 = 0x13ec1b160a58c0d2;
    local_10 = 0x5324a1627f4f8e29;
    local_8 = (uint8_t *)0x4a1ebeb5c53578dc;
    sub_0x0d138(&local_60,local_50,local_48,&local_40);
    goto LAB_ram_00000508;
  }
  local_var_2 = *(int64_t *)(param_2 + 0x10);
  if (0x7ffffffffffffffe < *(uint64_t *)(local_var_2 + 0x10)) {
    sub_0x0d068(&local_70,0xb,0);
    local_60 = local_70;
    local_58 = local_68;
    goto LAB_ram_00000508;
  }
  local_var_3 = *(uint64_t *)(local_var_2 + 0x10) + 1;
  *(int64_t *)(local_var_2 + 0x10) = local_var_3;
  local_uvar_5 = *(uint64_t *)(local_var_2 + 0x20);
  if (local_uvar_5 < 8) {
    plocal_var_7 = (int64_t *)0x8;
    plocal_uvar_6 = &DAT_ram_0001d720;
    sub_0x16590();
    if ((((*param_4 != *param_5) || (param_4[1] != param_5[1])) || (param_4[2] != param_5[2])) ||
       (local_uvar_4 = 0, param_4[3] != param_5[3])) {
      local_uvar_4 = 1;
    }
    local_var_2 = 2;
    if ((local_uvar_4 != 0) || (local_uvar_4 = local_uvar_5, local_var_3 = sub_0x075b0(), local_var_3 != 0))
    goto LAB_ram_00000648;
    local_var_3 = *(int64_t *)(local_uvar_5 + 0x10);
    if (*(int64_t *)(local_var_3 + 0x10) == 0) {
      *(uint64_t *)(local_var_3 + 0x10) = 0xffffffffffffffff;
      local_20 = *(uint64_t *)(local_var_3 + 0x18);
      local_18 = *(uint64_t *)(local_var_3 + 0x20);
      local_10 = 0;
      local_uvar_5 = sub_0x07498(&local_20,&DAT_ram_0001a558,8);
      if ((local_uvar_5 == 0) &&
         (local_8 = plocal_uvar_6, local_uvar_5 = sub_0x07498(&local_20,&local_8,8), local_uvar_5 == 0)) {
        local_uvar_4 = *(int64_t *)(local_var_3 + 0x10) + 1;
        *(uint64_t *)(local_var_3 + 0x10) = local_uvar_4;
        goto LAB_ram_00000648;
      }
      if (((1 < (local_uvar_5 & 3) - 2) && ((local_uvar_5 & 3) != 0)) &&
         ((code *)**(uint64_t **)(local_uvar_5 + 7) != (code *)0x0)) {
        (*(code *)**(uint64_t **)(local_uvar_5 + 7))(*(uint64_t *)(local_uvar_5 - 1));
      }
      sub_0x0eee8(&local_40,0xbbc);
      *(int64_t *)(local_var_3 + 0x10) = *(int64_t *)(local_var_3 + 0x10) + 1;
      local_uvar_4 = local_38;
      local_28 = local_38;
      local_30 = local_40;
      if (local_40 == 2) goto LAB_ram_00000648;
    }
    else {
      sub_0x0d068(&local_30,0xb,0);
    }
    local_uvar_4 = local_28;
    local_var_2 = local_30;
LAB_ram_00000648:
    plocal_var_7[1] = local_uvar_4;
    *plocal_var_7 = local_var_2;
    return;
  }
  if ((local_uvar_5 & 0xfffffffffffffff8) == 8) {
    local_uvar_5 = sub_0x11758(&DAT_ram_0001d628);
    sub_0x0eee8(&local_80,0xbbb);
    if (((1 < (local_uvar_5 & 3) - 2) && ((local_uvar_5 & 3) != 0)) &&
       ((code *)**(uint64_t **)(local_uvar_5 + 7) != (code *)0x0)) {
      (*(code *)**(uint64_t **)(local_uvar_5 + 7))(*(uint64_t *)(local_uvar_5 - 1));
    }
    local_var_3 = *(int64_t *)(local_var_2 + 0x10);
    if (local_80 != 2) {
      input[2] = local_78;
      input[1] = local_80;
      *input = 1;
      goto LAB_ram_00000548;
    }
  }
  else {
    local_78 = *(uint64_t *)(*(int64_t *)(local_var_2 + 0x18) + 8);
  }
  input[2] = local_78;
  input[1] = param_2;
  *input = 0;
LAB_ram_00000548:
  *(int64_t *)(local_var_2 + 0x10) = local_var_3 + -1;
  return;
}



/* Function: sub_0x00598 @ 0x598 */

void sub_0x00598(int64_t *input,int64_t param_2,uint64_t param_3,int64_t *param_4,
                     int64_t *param_5)

{
  int64_t local_var_1;
  uint64_t local_uvar_2;
  int64_t local_var_3;
  int64_t local_var_4;
  int64_t local_40;
  int64_t local_38;
  int64_t local_30;
  int64_t local_28;
  uint64_t local_20;
  uint64_t local_18;
  uint64_t local_10;
  uint64_t local_8;
  
  if ((((*param_4 != *param_5) || (param_4[1] != param_5[1])) || (param_4[2] != param_5[2])) ||
     (local_var_3 = 0, param_4[3] != param_5[3])) {
    local_var_3 = 1;
  }
  local_var_4 = 2;
  if ((local_var_3 == 0) && (local_var_3 = param_2, local_var_1 = sub_0x075b0(), local_var_1 == 0)) {
    local_var_1 = *(int64_t *)(param_2 + 0x10);
    if (*(int64_t *)(local_var_1 + 0x10) == 0) {
      *(uint64_t *)(local_var_1 + 0x10) = 0xffffffffffffffff;
      local_20 = *(uint64_t *)(local_var_1 + 0x18);
      local_18 = *(uint64_t *)(local_var_1 + 0x20);
      local_10 = 0;
      local_uvar_2 = sub_0x07498(&local_20,&DAT_ram_0001a558,8);
      if (local_uvar_2 == 0) {
        local_8 = param_3;
        local_uvar_2 = sub_0x07498(&local_20,&local_8,8);
        if (local_uvar_2 == 0) {
          local_var_3 = *(int64_t *)(local_var_1 + 0x10) + 1;
          *(int64_t *)(local_var_1 + 0x10) = local_var_3;
          goto LAB_ram_00000648;
        }
      }
      if (((1 < (local_uvar_2 & 3) - 2) && ((local_uvar_2 & 3) != 0)) &&
         ((code *)**(uint64_t **)(local_uvar_2 + 7) != (code *)0x0)) {
        (*(code *)**(uint64_t **)(local_uvar_2 + 7))(*(uint64_t *)(local_uvar_2 - 1));
      }
      sub_0x0eee8(&local_40,0xbbc);
      *(int64_t *)(local_var_1 + 0x10) = *(int64_t *)(local_var_1 + 0x10) + 1;
      local_var_3 = local_38;
      local_28 = local_38;
      local_30 = local_40;
      if (local_40 == 2) goto LAB_ram_00000648;
    }
    else {
      sub_0x0d068(&local_30,0xb,0);
    }
    local_var_3 = local_28;
    local_var_4 = local_30;
  }
LAB_ram_00000648:
  input[1] = local_var_3;
  *input = local_var_4;
  return;
}



/* Function: sub_0x00838 @ 0x838 */

void sub_0x00838(uint64_t *input,int64_t param_2)

{
  bool is_valid_1;
  int64_t local_var_2;
  int64_t *plocal_var_3;
  uint64_t local_90;
  uint64_t local_88;
  uint64_t local_80;
  uint64_t local_78;
  uint64_t local_70;
  uint64_t local_68;
  uint64_t local_60;
  uint64_t local_58;
  int64_t local_50;
  int64_t local_48;
  int64_t local_40;
  int64_t local_38;
  uint64_t local_30;
  uint64_t local_28;
  uint64_t local_20;
  uint64_t local_18;
  uint64_t local_10;
  uint64_t local_8;
  
  plocal_var_3 = *(int64_t **)(param_2 + 0x18);
  if ((((*plocal_var_3 == 0) && (plocal_var_3[1] == 0)) && (plocal_var_3[2] == 0)) &&
     ((plocal_var_3[3] == 0 && (local_var_2 = sub_0x10f40(param_2), local_var_2 == 0)))) {
    sub_0x0eee8(&local_90,0xbc4);
    local_70 = local_90;
    local_68 = local_88;
  }
  else {
    if (((*plocal_var_3 != -0x1551fae7e59eb1dc) ||
        ((plocal_var_3[1] != 0x13ec1b160a58c0d2 || (plocal_var_3[2] != 0x5324a1627f4f8e29)))) ||
       (is_valid_1 = false, plocal_var_3[3] != 0x4a1ebeb5c53578dc)) {
      is_valid_1 = true;
    }
    if (is_valid_1) {
      sub_0x0eee8(&local_60,0xbbf);
      local_38 = plocal_var_3[3];
      local_40 = plocal_var_3[2];
      local_48 = plocal_var_3[1];
      local_50 = *plocal_var_3;
      local_30 = 0xeaae05181a614e24;
      local_28 = 0x13ec1b160a58c0d2;
      local_20 = 0x5324a1627f4f8e29;
      local_18 = 0x4a1ebeb5c53578dc;
      sub_0x0d138(&local_70,local_60,local_58,&local_50);
    }
    else {
      local_var_2 = *(int64_t *)(param_2 + 0x10);
      if (*(uint64_t *)(local_var_2 + 0x10) < 0x7fffffffffffffff) {
        *(uint64_t *)(local_var_2 + 0x10) = *(uint64_t *)(local_var_2 + 0x10) + 1;
        local_10 = *(uint64_t *)(local_var_2 + 0x18);
        local_8 = *(uint64_t *)(local_var_2 + 0x20);
        sub_0x06f40(&local_50,&local_10);
        if (local_50 == 2) {
          input[2] = local_48;
          input[1] = param_2;
          *input = 0;
        }
        else {
          input[2] = local_48;
          input[1] = local_50;
          *input = 1;
        }
        *(int64_t *)(local_var_2 + 0x10) = *(int64_t *)(local_var_2 + 0x10) + -1;
        return;
      }
      sub_0x0d068(&local_80,0xb,0);
      local_70 = local_80;
      local_68 = local_78;
    }
  }
  input[2] = local_68;
  input[1] = local_70;
  *input = 1;
  return;
}



/* Function: sub_0x00c00 @ 0xc00 */

/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void sub_0x00c00(uint64_t *input,uint64_t param_2,uint64_t *param_3,uint64_t param_4,
                     int64_t param_5)

{
  uint64_t local_uvar_1;
  uint64_t local_uvar_2;
  
  sub_0x07428();
  local_uvar_2 = 0x300008000;
  if (_DAT_ram_300000000 != 0) {
    local_uvar_2 = _DAT_ram_300000000;
  }
  local_uvar_1 = local_uvar_2 - param_5;
  if ((local_uvar_1 <= local_uvar_2) && (0x300000007 < local_uvar_1)) {
    _DAT_ram_300000000 = local_uvar_1;
    sub_0x193a8(local_uvar_1,param_4,param_5);
    param_3[2] = local_uvar_1;
    param_3[3] = param_5;
    param_3[1] = param_5;
    *param_3 = 1;
    input[1] = param_3;
    *input = param_2;
    return;
  }
                    /* WARNING: Subroutine does not return */
  sub_0x12600(1,param_5,&DAT_ram_0001d6e0);
}



/* Function: sub_0x00dd8 @ 0xdd8 */

void sub_0x00dd8(int64_t input)

{
  int64_t local_var_1;
  
  local_var_1 = *((AccountContext *)input)->ref_count + -1;
  *((AccountContext *)input)->ref_count = local_var_1;
  if (local_var_1 == 0) {
    sub_0x10ea0(&((AccountContext *)input)->ref_count);
  }
  local_var_1 = **(int64_t **)(input + 0x10) + -1;
  **(int64_t **)(input + 0x10) = local_var_1;
  if (local_var_1 == 0) {
    sub_0x10ef0(input + 0x10);
  }
  return;
}



/* Function: sub_0x00e70 @ 0xe70 */

uint64_t sub_0x00e70(uint64_t input,uint64_t param_2,uint64_t *param_3)

{
  uint64_t local_uvar_1;
  uint64_t local_uvar_2;
  uint64_t local_uvar_3;
  uint64_t local_uvar_4;
  uint64_t local_uvar_5;
  uint64_t local_uvar_6;
  uint64_t local_uvar_7;
  
  local_uvar_3 = param_2 ^ 0x646f72616e646f6d;
  local_uvar_1 = (input ^ 0x736f6d6570736575) + local_uvar_3;
  local_uvar_6 = local_uvar_1 ^ (local_uvar_3 << 0xd | local_uvar_3 >> 0x33);
  local_uvar_3 = param_2 ^ *param_3 ^ 0x7465646279746573;
  local_uvar_2 = local_uvar_3 + (input ^ 0x6c7967656e657261);
  local_uvar_4 = local_uvar_2 + local_uvar_6;
  local_uvar_6 = local_uvar_4 ^ (local_uvar_6 << 0x11 | local_uvar_6 >> 0x2f);
  local_uvar_2 = local_uvar_2 ^ (local_uvar_3 << 0x10 | local_uvar_3 >> 0x30);
  local_uvar_3 = local_uvar_2 + (local_uvar_1 << 0x20 | local_uvar_1 >> 0x20);
  local_uvar_1 = (local_uvar_3 ^ *param_3) + local_uvar_6;
  local_uvar_6 = local_uvar_1 ^ (local_uvar_6 << 0xd | local_uvar_6 >> 0x33);
  local_uvar_7 = param_3[1] ^ (local_uvar_2 << 0x15 | local_uvar_2 >> 0x2b) ^ local_uvar_3;
  local_uvar_3 = local_uvar_7 + (local_uvar_4 << 0x20 | local_uvar_4 >> 0x20);
  local_uvar_2 = local_uvar_3 + local_uvar_6;
  local_uvar_4 = local_uvar_2 ^ (local_uvar_6 << 0x11 | local_uvar_6 >> 0x2f);
  local_uvar_3 = local_uvar_3 ^ (local_uvar_7 << 0x10 | local_uvar_7 >> 0x30);
  local_uvar_7 = local_uvar_3 + (local_uvar_1 << 0x20 | local_uvar_1 >> 0x20);
  local_uvar_1 = (local_uvar_7 ^ param_3[1]) + local_uvar_4;
  local_uvar_6 = local_uvar_1 ^ (local_uvar_4 << 0xd | local_uvar_4 >> 0x33);
  local_uvar_7 = param_3[2] ^ (local_uvar_3 << 0x15 | local_uvar_3 >> 0x2b) ^ local_uvar_7;
  local_uvar_3 = local_uvar_7 + (local_uvar_2 << 0x20 | local_uvar_2 >> 0x20);
  local_uvar_4 = local_uvar_3 + local_uvar_6;
  local_uvar_6 = local_uvar_4 ^ (local_uvar_6 << 0x11 | local_uvar_6 >> 0x2f);
  local_uvar_3 = local_uvar_3 ^ (local_uvar_7 << 0x10 | local_uvar_7 >> 0x30);
  local_uvar_7 = local_uvar_3 + (local_uvar_1 << 0x20 | local_uvar_1 >> 0x20);
  local_uvar_2 = (local_uvar_7 ^ param_3[2]) + local_uvar_6;
  local_uvar_1 = local_uvar_2 ^ (local_uvar_6 << 0xd | local_uvar_6 >> 0x33);
  local_uvar_7 = param_3[3] ^ (local_uvar_3 << 0x15 | local_uvar_3 >> 0x2b) ^ local_uvar_7;
  local_uvar_3 = local_uvar_7 + (local_uvar_4 << 0x20 | local_uvar_4 >> 0x20);
  local_uvar_6 = local_uvar_3 + local_uvar_1;
  local_uvar_1 = local_uvar_6 ^ (local_uvar_1 << 0x11 | local_uvar_1 >> 0x2f);
  local_uvar_3 = local_uvar_3 ^ (local_uvar_7 << 0x10 | local_uvar_7 >> 0x30);
  local_uvar_2 = local_uvar_3 + (local_uvar_2 << 0x20 | local_uvar_2 >> 0x20);
  local_uvar_4 = (local_uvar_2 ^ param_3[3]) + local_uvar_1;
  local_uvar_1 = local_uvar_4 ^ (local_uvar_1 << 0xd | local_uvar_1 >> 0x33);
  local_uvar_2 = (local_uvar_3 << 0x15 | local_uvar_3 >> 0x2b) ^ local_uvar_2;
  local_uvar_7 = local_uvar_2 ^ 0x2000000000000000;
  local_uvar_3 = local_uvar_7 + (local_uvar_6 << 0x20 | local_uvar_6 >> 0x20);
  local_uvar_6 = local_uvar_3 + local_uvar_1;
  local_uvar_1 = local_uvar_6 ^ (local_uvar_1 << 0x11 | local_uvar_1 >> 0x2f);
  local_uvar_3 = (local_uvar_2 << 0x10 | local_uvar_7 >> 0x30) ^ local_uvar_3;
  local_uvar_2 = local_uvar_3 + (local_uvar_4 << 0x20 | local_uvar_4 >> 0x20);
  local_uvar_5 = (local_uvar_2 ^ 0x2000000000000000) + local_uvar_1;
  local_uvar_4 = local_uvar_5 ^ (local_uvar_1 << 0xd | local_uvar_1 >> 0x33);
  local_uvar_2 = (local_uvar_3 << 0x15 | local_uvar_3 >> 0x2b) ^ local_uvar_2;
  local_uvar_1 = local_uvar_2 + ((local_uvar_6 << 0x20 | local_uvar_6 >> 0x20) ^ 0xff);
  local_uvar_7 = local_uvar_4 + local_uvar_1;
  local_uvar_4 = local_uvar_7 ^ (local_uvar_4 << 0x11 | local_uvar_4 >> 0x2f);
  local_uvar_1 = (local_uvar_2 << 0x10 | local_uvar_2 >> 0x30) ^ local_uvar_1;
  local_uvar_3 = local_uvar_1 + (local_uvar_5 << 0x20 | local_uvar_5 >> 0x20);
  local_uvar_6 = local_uvar_4 + local_uvar_3;
  local_uvar_2 = (local_uvar_4 << 0xd | local_uvar_4 >> 0x33) ^ local_uvar_6;
  local_uvar_3 = (local_uvar_1 << 0x15 | local_uvar_1 >> 0x2b) ^ local_uvar_3;
  local_uvar_1 = local_uvar_3 + (local_uvar_7 << 0x20 | local_uvar_7 >> 0x20);
  local_uvar_4 = local_uvar_2 + local_uvar_1;
  local_uvar_2 = (local_uvar_2 << 0x11 | local_uvar_2 >> 0x2f) ^ local_uvar_4;
  local_uvar_1 = (local_uvar_3 << 0x10 | local_uvar_3 >> 0x30) ^ local_uvar_1;
  local_uvar_3 = local_uvar_1 + (local_uvar_6 << 0x20 | local_uvar_6 >> 0x20);
  local_uvar_6 = (local_uvar_2 << 0xd | local_uvar_2 >> 0x33) ^ local_uvar_2 + local_uvar_3;
  local_uvar_3 = (local_uvar_1 << 0x15 | local_uvar_1 >> 0x2b) ^ local_uvar_3;
  local_uvar_2 = local_uvar_3 + (local_uvar_4 << 0x20 | local_uvar_4 >> 0x20);
  local_uvar_1 = (local_uvar_3 << 0x10 | local_uvar_3 >> 0x30) ^ local_uvar_2;
  local_uvar_2 = local_uvar_6 + local_uvar_2;
  return (local_uvar_1 << 0x15 | local_uvar_1 >> 0x2b) ^ (local_uvar_6 << 0x11 | local_uvar_6 >> 0x2f) ^
         (local_uvar_2 << 0x20 | local_uvar_2 >> 0x20) ^ local_uvar_2;
}



/* Function: sub_0x021c8 @ 0x21c8 */

void sub_0x021c8(uint64_t *input,uint64_t *param_2)

{
  uint8_t local_uvar_1;
  uint8_t local_uvar_2;
  uint64_t local_uvar_3;
  int64_t *plocal_var_4;
  uint64_t local_uvar_5;
  int64_t local_var_6;
  int64_t *plocal_var_7;
  uint64_t local_uvar_8;
  uint64_t uStack_10;
  uint64_t uStack_8;
  
  plocal_var_4 = (int64_t *)param_2[1];
  local_var_6 = *plocal_var_4;
  local_uvar_5 = *param_2;
  *plocal_var_4 = local_var_6 + 1;
  if (local_var_6 + 1 != 0) {
    plocal_var_7 = (int64_t *)param_2[2];
    local_var_6 = *plocal_var_7;
    *plocal_var_7 = local_var_6 + 1;
    if (local_var_6 + 1 != 0) {
      local_uvar_3 = param_2[3];
      local_uvar_8 = param_2[4];
      local_uvar_1 = *(uint8_t *)(param_2 + 5);
      local_uvar_2 = *(uint8_t *)((int64_t)param_2 + 0x29);
      *(uint8_t *)((int64_t)input + 0x2a) = *(uint8_t *)((int64_t)param_2 + 0x2a);
      *(uint8_t *)((int64_t)input + 0x29) = local_uvar_2;
      *(uint8_t *)(input + 5) = local_uvar_1;
      input[4] = local_uvar_8;
      input[3] = local_uvar_3;
      input[2] = plocal_var_7;
      input[1] = plocal_var_4;
      *input = local_uvar_5;
      return;
    }
  }
  sub_0x022c0();
  if (plocal_var_4[1] == 0) {
    sub_0x0eee8(&uStack_10,0xbbd);
    input[1] = uStack_8;
    *input = uStack_10;
  }
  else {
    plocal_var_4[1] = plocal_var_4[1] + -1;
    *plocal_var_4 = *plocal_var_4 + 0x30;
    sub_0x07430();
  }
  return;
}



/* Function: sub_0x022c0 @ 0x22c0 */

void sub_0x022c0(uint64_t *input,uint64_t param_2,int64_t *param_3)

{
  uint64_t uStack_10;
  uint64_t uStack_8;
  
  sub_0x022c0();
  if (param_3[1] == 0) {
    sub_0x0eee8(&uStack_10,0xbbd);
    input[1] = uStack_8;
    *input = uStack_10;
  }
  else {
    param_3[1] = param_3[1] + -1;
    *param_3 = *param_3 + 0x30;
    sub_0x07430();
  }
  return;
}



/* Function: sub_0x022c8 @ 0x22c8 */

void sub_0x022c8(uint64_t *input,uint64_t param_2,int64_t *param_3)

{
  uint64_t local_10;
  uint64_t local_8;
  
  if (param_3[1] == 0) {
    sub_0x0eee8(&local_10,0xbbd);
    input[1] = local_8;
    *input = local_10;
  }
  else {
    param_3[1] = param_3[1] + -1;
    *param_3 = *param_3 + 0x30;
    sub_0x07430();
  }
  return;
}



/* Function: sub_0x02370 @ 0x2370 */

void sub_0x02370(uint64_t *input,uint64_t param_2,int64_t *param_3)

{
  uint64_t local_10;
  uint64_t local_8;
  
  if (param_3[1] == 0) {
    sub_0x0eee8(&local_10,0xbbd);
    input[2] = local_8;
    input[1] = local_10;
    *input = 1;
  }
  else {
    param_3[1] = param_3[1] + -1;
    *param_3 = *param_3 + 0x30;
    sub_0x00838();
  }
  return;
}



/* Function: sub_0x02420 @ 0x2420 */

void sub_0x02420(uint64_t *input,uint64_t param_2,int64_t *param_3)

{
  bool is_valid_1;
  uint64_t *plocal_uvar_2;
  int64_t *plocal_var_3;
  uint64_t local_80;
  uint64_t local_78;
  uint64_t local_70;
  uint64_t local_68;
  uint64_t local_60;
  uint64_t local_58;
  uint64_t local_50;
  uint64_t local_48;
  int64_t local_40;
  int64_t local_38;
  int64_t local_30;
  int64_t local_28;
  uint64_t local_20;
  uint64_t local_18;
  uint64_t local_10;
  uint64_t local_8;
  
  if (param_3[1] == 0) {
    sub_0x0eee8(&local_80,0xbbd);
    local_60 = local_80;
    local_58 = local_78;
  }
  else {
    param_3[1] = param_3[1] + -1;
    plocal_uvar_2 = (uint64_t *)*param_3;
    *param_3 = (int64_t)(plocal_uvar_2 + 6);
    local_28 = 0;
    local_30 = 0;
    local_38 = 0;
    local_40 = 0;
    plocal_var_3 = (int64_t *)*plocal_uvar_2;
    if ((((*plocal_var_3 != 0) || (plocal_var_3[1] != 0)) || (plocal_var_3[2] != 0)) ||
       (is_valid_1 = false, plocal_var_3[3] != 0)) {
      is_valid_1 = true;
    }
    if (is_valid_1) {
      sub_0x0eee8(&local_50,0xbc0);
      local_28 = plocal_var_3[3];
      local_30 = plocal_var_3[2];
      local_38 = plocal_var_3[1];
      local_40 = *plocal_var_3;
      local_20 = 0;
      local_18 = 0;
      local_10 = 0;
      local_8 = 0;
      sub_0x0d138(&local_60,local_50,local_48,&local_40);
    }
    else {
      if (*(char *)((int64_t)plocal_uvar_2 + 0x2a) != '\0') {
        input[1] = plocal_uvar_2;
        *input = 2;
        return;
      }
      sub_0x0eee8(&local_70,0xbc1);
      local_60 = local_70;
      local_58 = local_68;
    }
  }
  input[1] = local_58;
  *input = local_60;
  return;
}



/* Function: sub_0x02678 @ 0x2678 */

/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void sub_0x02678(uint64_t *input,int64_t *param_2,int64_t param_3,uint64_t *param_4,
                     uint64_t param_5)

{
  byte is_valid_1;
  uint64_t *plocal_uvar_2;
  byte is_valid_3;
  uint64_t local_uvar_4;
  uint64_t local_uvar_5;
  uint64_t local_uvar_6;
  uint64_t *plocal_uvar_7;
  int64_t local_var_8;
  int64_t local_var_9;
  uint64_t local_uvar_10;
  uint64_t local_uvar_11;
  uint64_t local_uvar_12;
  uint64_t local_uvar_13;
  uint64_t local_uvar_14;
  uint64_t local_uvar_15;
  int64_t local_var_16;
  uint64_t local_uvar_17;
  byte *pis_valid_18;
  uint64_t local_uvar_19;
  uint64_t *plocal_uvar_20;
  uint64_t local_uvar_21;
  uint64_t *plocal_uvar_22;
  uint64_t local_40;
  int64_t *local_38;
  uint64_t local_30;
  int64_t *local_28;
  uint64_t local_20;
  int64_t *local_18;
  uint64_t local_10;
  int64_t *local_8;
  
  local_uvar_17 = param_2[3];
  if (local_uvar_17 + param_3 < local_uvar_17) {
    sub_0x12188(&local_40,param_5);
    local_8 = local_38;
    local_10 = local_40;
    goto LAB_ram_00003730;
  }
  local_uvar_4 = local_uvar_17 + param_3;
  local_uvar_19 = param_2[1];
  local_uvar_5 = local_uvar_19 + 1;
  local_uvar_21 = local_uvar_19;
  if (7 < local_uvar_19) {
    local_uvar_21 = (local_uvar_5 >> 3) * 7;
  }
  if (local_uvar_21 >> 1 < local_uvar_4) {
    local_uvar_5 = local_uvar_21 + 1;
    if (local_uvar_21 + 1 <= local_uvar_4) {
      local_uvar_5 = local_uvar_4;
    }
    if (local_uvar_5 < 0xf) {
      local_uvar_4 = 4;
      if ((3 < local_uvar_5) && (local_uvar_4 = 8, 7 < local_uvar_5)) {
        local_uvar_4 = 0x10;
      }
LAB_ram_00002f60:
      local_var_16 = local_uvar_4 + 8;
      local_uvar_21 = local_uvar_4 * 0x20;
      if ((local_uvar_21 <= local_uvar_21 + local_var_16) && (local_uvar_5 = local_uvar_21 + local_var_16, local_uvar_5 < 0x7ffffffffffffff9)) {
        sub_0x07428();
        local_uvar_19 = 0x300008000;
        if (_DAT_ram_300000000 != 0) {
          local_uvar_19 = _DAT_ram_300000000;
        }
        local_uvar_15 = local_uvar_19 - local_uvar_5;
        if ((local_uvar_19 < local_uvar_15) || (local_uvar_15 < 0x300000008)) {
          sub_0x12200(&local_20,param_5,8,local_uvar_5);
          local_8 = local_18;
          local_10 = local_20;
          goto LAB_ram_00003730;
        }
        _DAT_ram_300000000 = local_uvar_15 & 0xfffffffffffffff8;
        plocal_uvar_7 = (uint64_t *)(_DAT_ram_300000000 + local_uvar_21);
        sub_0x193e8(plocal_uvar_7,0xff,local_var_16);
        local_uvar_5 = local_uvar_4 - 1;
        local_uvar_21 = local_uvar_5;
        if (8 < local_uvar_4) {
          local_uvar_21 = (local_uvar_4 >> 3) * 7;
        }
        if (local_uvar_17 != 0) {
          plocal_uvar_20 = (uint64_t *)*param_2;
          local_uvar_19 = (*plocal_uvar_20 ^ 0xffffffffffffffff) & 0x8080808080808080;
          local_var_16 = 0;
          local_uvar_13 = param_4[1];
          local_uvar_11 = *param_4;
          local_uvar_4 = local_uvar_17;
          plocal_uvar_22 = plocal_uvar_20;
          do {
            if (local_uvar_19 == 0) {
              do {
                local_var_16 = local_var_16 + 8;
                plocal_uvar_2 = plocal_uvar_22 + 1;
                plocal_uvar_22 = plocal_uvar_22 + 1;
              } while ((*plocal_uvar_2 & 0x8080808080808080) == 0x8080808080808080);
              local_uvar_19 = *plocal_uvar_2 & 0x8080808080808080 ^ 0x8080808080808080;
            }
            local_var_8 = (uint64_t)
                    ((byte)(&DAT_ram_0001a1d8)[(local_uvar_19 & -local_uvar_19) * 0x218a392cd3d5dbf >> 0x3a] >> 3)
                    + local_var_16;
            local_uvar_15 = sub_0x00e70(local_uvar_11,local_uvar_13,plocal_uvar_20 + local_var_8 * -4 + -4);
            local_uvar_12 = local_uvar_15 & local_uvar_5;
            local_uvar_14 = *(uint64_t *)((int64_t)plocal_uvar_7 + local_uvar_12) & 0x8080808080808080;
            if (local_uvar_14 == 0) {
              local_var_9 = 8;
              do {
                local_uvar_12 = local_uvar_12 + local_var_9 & local_uvar_5;
                local_uvar_14 = *(uint64_t *)((int64_t)plocal_uvar_7 + local_uvar_12) & 0x8080808080808080;
                local_var_9 = local_var_9 + 8;
              } while (local_uvar_14 == 0);
            }
            local_uvar_12 = ((byte)(&DAT_ram_0001a1d8)[(local_uvar_14 & -local_uvar_14) * 0x218a392cd3d5dbf >> 0x3a] >> 3
                     ) + local_uvar_12 & local_uvar_5;
            if (-1 < *(char *)((int64_t)plocal_uvar_7 + local_uvar_12)) {
              local_uvar_12 = (uint64_t)
                       ((byte)(&DAT_ram_0001a1d8)
                              [(*plocal_uvar_7 & 0x8080808080808080 & -(*plocal_uvar_7 & 0x8080808080808080)) *
                               0x218a392cd3d5dbf >> 0x3a] >> 3);
            }
            local_uvar_19 = local_uvar_19 - 1 & local_uvar_19;
            local_uvar_4 = local_uvar_4 - 1;
            is_valid_3 = (byte)(local_uvar_15 >> 0x39);
            *(byte *)((int64_t)plocal_uvar_7 + local_uvar_12) = is_valid_3;
            *(byte *)((int64_t)plocal_uvar_7 + (local_uvar_12 - 8 & local_uvar_5) + 8) = is_valid_3;
            plocal_uvar_7[local_uvar_12 * -4 + -1] = plocal_uvar_20[local_var_8 * -4 + -1];
            plocal_uvar_7[local_uvar_12 * -4 + -2] = plocal_uvar_20[local_var_8 * -4 + -2];
            plocal_uvar_7[local_uvar_12 * -4 + -3] = plocal_uvar_20[local_var_8 * -4 + -3];
            plocal_uvar_7[local_uvar_12 * -4 + -4] = plocal_uvar_20[local_var_8 * -4 + -4];
          } while (local_uvar_4 != 0);
        }
        param_2[1] = local_uvar_5;
        *param_2 = (int64_t)plocal_uvar_7;
        param_2[2] = local_uvar_21 - local_uvar_17;
        goto LAB_ram_00003718;
      }
    }
    else {
      if (0x1fffffffffffffff < local_uvar_5) {
        sub_0x12188(&local_10,param_5);
        goto LAB_ram_00003730;
      }
      local_uvar_21 = (local_uvar_5 << 3) / 7 - 1;
      local_uvar_21 = local_uvar_21 | local_uvar_21 >> 1;
      local_uvar_21 = local_uvar_21 | local_uvar_21 >> 2;
      local_uvar_21 = local_uvar_21 | local_uvar_21 >> 4;
      local_uvar_21 = local_uvar_21 | local_uvar_21 >> 8;
      local_uvar_21 = local_uvar_21 | local_uvar_21 >> 0x10;
      local_uvar_21 = (local_uvar_21 | local_uvar_21 >> 0x20) ^ 0xffffffffffffffff;
      local_uvar_21 = local_uvar_21 - (local_uvar_21 >> 1 & 0x5555555555555555);
      local_uvar_21 = (local_uvar_21 & 0x3333333333333333) + (local_uvar_21 >> 2 & 0x3333333333333333);
      local_uvar_21 = 0xffffffffffffffff >>
               ((local_uvar_21 + (local_uvar_21 >> 4) & 0xf0f0f0f0f0f0f0f) * 0x101010101010101 >> 0x38);
      local_uvar_4 = local_uvar_21 + 1;
      if (local_uvar_21 < 0x7ffffffffffffff) goto LAB_ram_00002f60;
    }
    sub_0x12188(&local_30,param_5);
    local_8 = local_28;
    local_10 = local_30;
  }
  else {
    plocal_uvar_22 = (uint64_t *)*param_2;
    plocal_uvar_7 = plocal_uvar_22;
    for (local_var_16 = (local_uvar_5 >> 3) + (uint64_t)((local_uvar_5 & 7) != 0); local_var_16 != 0; local_var_16 = local_var_16 + -1) {
      *plocal_uvar_7 = ((*plocal_uvar_7 ^ 0xffffffffffffffff) >> 7 & 0x101010101010101) +
                (*plocal_uvar_7 | 0x7f7f7f7f7f7f7f7f);
      plocal_uvar_7 = plocal_uvar_7 + 1;
    }
    if (local_uvar_5 < 8) {
      sub_0x193c8(plocal_uvar_22 + 1,plocal_uvar_22,local_uvar_5);
      if (local_uvar_5 != 0) goto LAB_ram_00002890;
    }
    else {
      *(uint64_t *)((int64_t)plocal_uvar_22 + local_uvar_5) = *plocal_uvar_22;
LAB_ram_00002890:
      local_uvar_11 = param_4[1];
      local_uvar_13 = *param_4;
      local_uvar_4 = 1;
      local_uvar_15 = 0;
      do {
        local_uvar_12 = local_uvar_4;
        pis_valid_18 = (byte *)((int64_t)plocal_uvar_22 + local_uvar_15);
        if (*pis_valid_18 == 0x80) {
          plocal_uvar_7 = plocal_uvar_22 + local_uvar_15 * -4 + -4;
          while( true ) {
            local_uvar_14 = sub_0x00e70(local_uvar_13,local_uvar_11,plocal_uvar_22 + local_uvar_15 * -4 + -4);
            local_uvar_6 = local_uvar_14 & local_uvar_19;
            local_uvar_10 = *(uint64_t *)((int64_t)plocal_uvar_22 + local_uvar_6) & 0x8080808080808080;
            local_uvar_4 = local_uvar_6;
            if (local_uvar_10 == 0) {
              local_var_16 = 8;
              do {
                local_uvar_4 = local_uvar_4 + local_var_16 & local_uvar_19;
                local_uvar_10 = *(uint64_t *)((int64_t)plocal_uvar_22 + local_uvar_4) & 0x8080808080808080;
                local_var_16 = local_var_16 + 8;
              } while (local_uvar_10 == 0);
            }
            local_uvar_4 = ((byte)(&DAT_ram_0001a1d8)[(local_uvar_10 & -local_uvar_10) * 0x218a392cd3d5dbf >> 0x3a] >> 3)
                    + local_uvar_4 & local_uvar_19;
            if (-1 < *(char *)((int64_t)plocal_uvar_22 + local_uvar_4)) {
              local_uvar_4 = (uint64_t)
                      ((byte)(&DAT_ram_0001a1d8)
                             [(*plocal_uvar_22 & 0x8080808080808080 & -(*plocal_uvar_22 & 0x8080808080808080)) *
                              0x218a392cd3d5dbf >> 0x3a] >> 3);
            }
            is_valid_3 = (byte)(local_uvar_14 >> 0x38);
            if (((local_uvar_4 - local_uvar_6 ^ local_uvar_15 - local_uvar_6) & local_uvar_19) < 8) {
              is_valid_3 = is_valid_3 >> 1;
              *pis_valid_18 = is_valid_3;
              *(byte *)((int64_t)plocal_uvar_22 + (local_uvar_15 - 8 & local_uvar_19) + 8) = is_valid_3;
              goto code_r0x00002d10;
            }
            is_valid_1 = *(byte *)((int64_t)plocal_uvar_22 + local_uvar_4);
            is_valid_3 = is_valid_3 >> 1;
            *(byte *)((int64_t)plocal_uvar_22 + local_uvar_4) = is_valid_3;
            *(byte *)((int64_t)plocal_uvar_22 + (local_uvar_4 - 8 & local_uvar_19) + 8) = is_valid_3;
            plocal_uvar_20 = plocal_uvar_22 + local_uvar_4 * -4 + -4;
            if (is_valid_1 == 0xff) break;
            local_uvar_14 = *plocal_uvar_7;
            *plocal_uvar_7 = *plocal_uvar_20;
            *plocal_uvar_20 = local_uvar_14;
            local_uvar_14 = plocal_uvar_22[local_uvar_15 * -4 + -3];
            plocal_uvar_22[local_uvar_15 * -4 + -3] = plocal_uvar_22[local_uvar_4 * -4 + -3];
            plocal_uvar_22[local_uvar_4 * -4 + -3] = local_uvar_14;
            local_uvar_14 = plocal_uvar_22[local_uvar_15 * -4 + -2];
            plocal_uvar_22[local_uvar_15 * -4 + -2] = plocal_uvar_22[local_uvar_4 * -4 + -2];
            plocal_uvar_22[local_uvar_4 * -4 + -2] = local_uvar_14;
            local_uvar_14 = plocal_uvar_22[local_uvar_15 * -4 + -1];
            plocal_uvar_22[local_uvar_15 * -4 + -1] = plocal_uvar_22[local_uvar_4 * -4 + -1];
            plocal_uvar_22[local_uvar_4 * -4 + -1] = local_uvar_14;
          }
          *pis_valid_18 = 0xff;
          *(uint8_t *)((int64_t)plocal_uvar_22 + (local_uvar_15 - 8 & local_uvar_19) + 8) = 0xff;
          plocal_uvar_22[local_uvar_4 * -4 + -1] = plocal_uvar_22[local_uvar_15 * -4 + -1];
          plocal_uvar_22[local_uvar_4 * -4 + -2] = plocal_uvar_22[local_uvar_15 * -4 + -2];
          plocal_uvar_22[local_uvar_4 * -4 + -3] = plocal_uvar_22[local_uvar_15 * -4 + -3];
          *plocal_uvar_20 = *plocal_uvar_7;
        }
code_r0x00002d10:
        local_uvar_4 = local_uvar_12 + (local_uvar_12 < local_uvar_5);
        local_uvar_15 = local_uvar_12;
      } while (local_uvar_12 < local_uvar_5);
    }
    param_2[2] = local_uvar_21 - local_uvar_17;
LAB_ram_00003718:
    local_10 = 0x8000000000000001;
    local_8 = param_2;
  }
LAB_ram_00003730:
  *input = local_10;
  input[1] = local_8;
  return;
}



/* Function: sub_0x03780 @ 0x3780 */

void sub_0x03780(uint32_t *input,int64_t *param_2,uint64_t param_3,uint64_t param_4,
                     int64_t param_5)

{
  bool is_valid_1;
  uint32_t local_uvar_2;
  int64_t *plocal_var_3;
  uint32_t local_uvar_4;
  uint32_t local_68;
  uint32_t local_64;
  int64_t local_60;
  uint64_t local_58;
  int64_t local_50;
  uint64_t local_48;
  int64_t local_40;
  uint64_t local_38;
  int64_t local_30;
  uint64_t local_28;
  int64_t local_20;
  uint64_t local_18;
  uint8_t local_10 [16];
  
  plocal_var_3 = *(int64_t **)(param_5 + -0x1000);
  if ((((*param_2 != -0x1551fae7e59eb1dc) || (param_2[1] != 0x13ec1b160a58c0d2)) ||
      (param_2[2] != 0x5324a1627f4f8e29)) || (is_valid_1 = false, param_2[3] != 0x4a1ebeb5c53578dc)) {
    is_valid_1 = true;
  }
  if (is_valid_1) {
    local_uvar_4 = 0x1004;
    sub_0x0eee8(&local_20);
    local_uvar_2 = local_64;
    local_60 = local_20;
    local_58 = local_18;
    goto joined_r0x00003908;
  }
  if (7 < *(uint64_t *)(param_5 + -0xff8)) {
    if (*plocal_var_3 == 0x7c23ace757645943) {
      sub_0x03a90(&local_60);
      local_uvar_4 = (int)param_2;
      local_uvar_2 = local_64;
      goto joined_r0x00003908;
    }
    if (*plocal_var_3 == 0x213bae680968120b) {
      sub_0x03bb8(&local_50);
      local_uvar_4 = (int)param_2;
      local_uvar_2 = local_64;
      local_60 = local_50;
      local_58 = local_48;
      goto joined_r0x00003908;
    }
    if (*plocal_var_3 == 0x1d9acb512ea545e4) {
      local_uvar_4 = 0x5dc;
      sub_0x0eee8(&local_40);
      local_uvar_2 = local_64;
      local_60 = local_40;
      local_58 = local_38;
      goto joined_r0x00003908;
    }
  }
  local_uvar_4 = 0x65;
  sub_0x0eee8(&local_30);
  local_uvar_2 = local_64;
  local_60 = local_30;
  local_58 = local_28;
joined_r0x00003908:
  local_64 = local_uvar_4;
  if (local_60 == 2) {
    local_68 = 0x1a;
  }
  else {
    local_64 = local_uvar_2;
    sub_0x0d0f8(local_10);
    sub_0x0e008(&local_68,local_60,local_58);
  }
  input[1] = local_64;
  *input = local_68;
  return;
}



/* Function: sub_0x03a90 @ 0x3a90 */

void sub_0x03a90(uint64_t *input,uint64_t param_2,uint64_t param_3,uint64_t param_4)

{
  uint64_t uStack_60;
  uint64_t uStack_58;
  uint64_t uStack_50;
  uint64_t uStack_48;
  int64_t lStack_40;
  uint64_t uStack_38;
  uint64_t uStack_30;
  uint64_t uStack_28;
  int64_t lStack_20;
  uint64_t uStack_18;
  uint64_t uStack_10;
  uint64_t uStack_8;
  
  sub_0x03ac8("Instruction: InitializeCounterInstruction: IncrementIntentional panic to test execution PC tracing!payercounter"
                   ,0x1e);
  uStack_50 = param_3;
  uStack_48 = param_4;
  sub_0x04508(&lStack_20,param_2,&uStack_50);
  if (lStack_20 != 0) {
    uStack_28 = uStack_8;
    uStack_30 = uStack_10;
    uStack_38 = uStack_18;
    lStack_40 = lStack_20;
    sub_0x06088(&uStack_60,&lStack_40,param_2);
    uStack_10 = uStack_58;
    uStack_18 = uStack_60;
  }
  *input = uStack_18;
  input[1] = uStack_10;
  return;
}



/* Function: sub_0x03ac8 @ 0x3ac8 */

void sub_0x03ac8(void)

{
  uint64_t *unaff_R6;
  uint64_t local_60;
  uint64_t local_58;
  int64_t local_40;
  uint64_t local_38;
  uint64_t local_30;
  uint64_t local_28;
  int64_t local_20;
  uint64_t local_18;
  uint64_t local_10;
  uint64_t local_8;
  
  sub_0x03ac8();
  sub_0x04508(&local_20);
  if (local_20 != 0) {
    local_28 = local_8;
    local_30 = local_10;
    local_38 = local_18;
    local_40 = local_20;
    sub_0x06088(&local_60,&local_40);
    local_10 = local_58;
    local_18 = local_60;
  }
  *unaff_R6 = local_18;
  unaff_R6[1] = local_10;
  return;
}



/* Function: sub_0x03bb8 @ 0x3bb8 */

void sub_0x03bb8(uint64_t *input,uint64_t param_2,uint64_t param_3,uint64_t param_4)

{
  uint64_t uStack_60;
  int64_t lStack_58;
  uint64_t uStack_50;
  uint64_t uStack_48;
  uint64_t uStack_40;
  uint64_t uStack_38;
  uint8_t *puStack_30;
  uint64_t uStack_28;
  int64_t lStack_20;
  uint64_t uStack_18;
  uint64_t uStack_10;
  
  sub_0x03bf0("Instruction: IncrementIntentional panic to test execution PC tracing!payercounter"
                   ,0x16);
  uStack_50 = param_3;
  uStack_48 = param_4;
  sub_0x06268(&puStack_30);
  if (puStack_30 != (uint8_t *)0x1) {
    uStack_40 = uStack_28;
    if (lStack_20 != 0) {
      puStack_30 = &DAT_ram_0001d6f8;
      uStack_10 = 0;
      uStack_28 = 1;
      uStack_18 = 0;
      lStack_20 = 8;
                    /* WARNING: Subroutine does not return */
      sub_0x136d0(&puStack_30,&DAT_ram_0001d708);
    }
    uStack_38 = 1;
    sub_0x06d60(&uStack_60,&uStack_40,param_2);
    lStack_20 = lStack_58;
    uStack_28 = uStack_60;
  }
  *input = uStack_28;
  input[1] = lStack_20;
  return;
}



/* Function: sub_0x03bf0 @ 0x3bf0 */

void sub_0x03bf0(void)

{
  uint64_t *unaff_R6;
  uint64_t local_60;
  int64_t local_58;
  uint64_t local_40;
  uint64_t local_38;
  uint8_t *local_30;
  uint64_t local_28;
  int64_t local_20;
  uint64_t local_18;
  uint64_t local_10;
  
  sub_0x03bf0();
  sub_0x06268(&local_30);
  if (local_30 != (uint8_t *)0x1) {
    local_40 = local_28;
    if (local_20 != 0) {
      local_30 = &DAT_ram_0001d6f8;
      local_10 = 0;
      local_28 = 1;
      local_18 = 0;
      local_20 = 8;
                    /* WARNING: Subroutine does not return */
      sub_0x136d0(&local_30,&DAT_ram_0001d708);
    }
    local_38 = 1;
    sub_0x06d60(&local_60,&local_40);
    local_20 = local_58;
    local_28 = local_60;
  }
  *unaff_R6 = local_28;
  unaff_R6[1] = local_20;
  return;
}



/* Function: entrypoint @ 0x3d40 */

uint64_t entrypoint(uint8_t *input)

{
  int64_t local_var_1;
  int64_t local_var_2;
  uint64_t *plocal_uvar_3;
  uint64_t local_uvar_4;
  uint local_38;
  uint local_34;
  uint8_t auStack_30 [8];
  int64_t local_28;
  int64_t local_20;
  uint64_t local_18;
  
  sub_0x10270(auStack_30,input);
  sub_0x03780(&local_38,local_18,local_28,local_20);
  local_uvar_4 = 0;
  if (local_38 != 0x1a) {
    if (local_38 < 0xd) {
      if (local_38 < 6) {
        if (local_38 < 3) {
          if (local_38 == 0) {
            local_uvar_4 = (uint64_t)local_34;
            if (local_uvar_4 == 0) {
              local_uvar_4 = 0x100000000;
            }
          }
          else {
            local_uvar_4 = 0x200000000;
            if (local_38 != 1) {
              local_uvar_4 = 0x300000000;
            }
          }
        }
        else if (local_38 == 3) {
          local_uvar_4 = 0x400000000;
        }
        else if (local_38 == 4) {
          local_uvar_4 = 0x500000000;
        }
        else {
          local_uvar_4 = 0x600000000;
        }
      }
      else if (local_38 < 9) {
        if (local_38 == 6) {
          local_uvar_4 = 0x700000000;
        }
        else if (local_38 == 7) {
          local_uvar_4 = 0x800000000;
        }
        else {
          local_uvar_4 = 0x900000000;
        }
      }
      else if (local_38 < 0xb) {
        if (local_38 == 9) {
          local_uvar_4 = 0xa00000000;
        }
        else {
          local_uvar_4 = 0xb00000000;
        }
      }
      else if (local_38 == 0xb) {
        local_uvar_4 = 0xc00000000;
      }
      else {
        local_uvar_4 = 0xd00000000;
      }
    }
    else if (local_38 < 0x13) {
      if (local_38 < 0x10) {
        if (local_38 == 0xd) {
          local_uvar_4 = 0xe00000000;
        }
        else if (local_38 == 0xe) {
          local_uvar_4 = 0xf00000000;
        }
        else {
          local_uvar_4 = 0x1000000000;
        }
      }
      else if (local_38 == 0x10) {
        local_uvar_4 = 0x1100000000;
      }
      else if (local_38 == 0x11) {
        local_uvar_4 = 0x1200000000;
      }
      else {
        local_uvar_4 = 0x1300000000;
      }
    }
    else if (local_38 < 0x16) {
      if (local_38 == 0x13) {
        local_uvar_4 = 0x1400000000;
      }
      else if (local_38 == 0x14) {
        local_uvar_4 = 0x1500000000;
      }
      else {
        local_uvar_4 = 0x1600000000;
      }
    }
    else if (local_38 < 0x18) {
      if (local_38 == 0x16) {
        local_uvar_4 = 0x1700000000;
      }
      else {
        local_uvar_4 = 0x1800000000;
      }
    }
    else if (local_38 == 0x18) {
      local_uvar_4 = 0x1900000000;
    }
    else {
      local_uvar_4 = 0x1a00000000;
    }
  }
  if (local_20 != 0) {
    plocal_uvar_3 = (uint64_t *)(local_28 + 0x10);
    local_var_2 = local_20;
    do {
      local_var_1 = *(int64_t *)plocal_uvar_3[-1] + -1;
      *(int64_t *)plocal_uvar_3[-1] = local_var_1;
      if (local_var_1 == 0) {
        sub_0x10ea0(plocal_uvar_3 + -1);
      }
      local_var_1 = *(int64_t *)*plocal_uvar_3 + -1;
      *(int64_t *)*plocal_uvar_3 = local_var_1;
      if (local_var_1 == 0) {
        sub_0x10ef0(plocal_uvar_3);
      }
      plocal_uvar_3 = plocal_uvar_3 + 6;
      local_var_2 = local_var_2 + -1;
    } while (local_var_2 != 0);
  }
  return local_uvar_4;
}



/* Function: sub_0x041e8 @ 0x41e8 */

/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

uint64_t sub_0x041e8(int64_t input,int64_t param_2)

{
  uint64_t local_uvar_1;
  uint64_t local_uvar_2;
  
  local_uvar_2 = 0x300008000;
  if (_DAT_ram_300000000 != 0) {
    local_uvar_2 = _DAT_ram_300000000;
  }
  local_uvar_1 = 0;
  if ((local_uvar_2 - input <= local_uvar_2) && (local_uvar_2 = local_uvar_2 - input & -param_2, 0x300000007 < local_uvar_2)) {
    local_uvar_1 = local_uvar_2;
    _DAT_ram_300000000 = local_uvar_2;
  }
  return local_uvar_1;
}



/* Function: sub_0x042f8 @ 0x42f8 */

void sub_0x042f8(void)

{
  return;
}



/* Function: sub_0x04300 @ 0x4300 */

/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

uint64_t sub_0x04300(uint64_t input,uint64_t param_2,int64_t param_3,uint64_t param_4)

{
  uint64_t local_uvar_1;
  uint64_t local_uvar_2;
  
  local_uvar_2 = 0x300008000;
  if (_DAT_ram_300000000 != 0) {
    local_uvar_2 = _DAT_ram_300000000;
  }
  local_uvar_1 = 0;
  if ((local_uvar_2 - param_4 <= local_uvar_2) && (local_uvar_2 = local_uvar_2 - param_4 & -param_3, 0x300000007 < local_uvar_2)) {
    if (param_2 <= param_4) {
      param_4 = param_2;
    }
    _DAT_ram_300000000 = local_uvar_2;
    sub_0x193a8(local_uvar_2,input,param_4);
    local_uvar_1 = local_uvar_2;
  }
  return local_uvar_1;
}



/* Function: custom_panic @ 0x4448 */

/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void panic_handler(uint64_t *input)

{
  uint64_t local_uvar_1;
  uint64_t *plocal_uvar_2;
  uint64_t *plocal_uvar_3;
  int64_t local_var_4;
  int64_t *plocal_var_5;
  int64_t lStack_178;
  uint64_t uStack_170;
  int64_t lStack_168;
  uint64_t uStack_160;
  uint64_t uStack_158;
  uint64_t uStack_150;
  int64_t lStack_148;
  uint64_t uStack_140;
  uint64_t uStack_138;
  uint64_t uStack_130;
  int64_t lStack_128;
  uint64_t uStack_120;
  uint64_t uStack_118;
  uint64_t uStack_110;
  int64_t lStack_108;
  uint64_t uStack_100;
  uint64_t uStack_f8;
  uint64_t uStack_f0;
  int64_t lStack_e8;
  uint64_t uStack_e0;
  uint64_t uStack_d8;
  uint64_t uStack_d0;
  int64_t lStack_c8;
  uint64_t *puStack_c0;
  int64_t lStack_b8;
  uint64_t *puStack_b0;
  int64_t lStack_a8;
  uint64_t *puStack_a0;
  int64_t lStack_98;
  uint64_t *puStack_90;
  uint32_t auStack_88 [5];
  uint32_t uStack_74;
  int64_t lStack_70;
  int64_t lStack_68;
  uint64_t uStack_60;
  int iStack_40;
  uint32_t uStack_3c;
  uint32_t uStack_38;
  uint32_t uStack_34;
  uint64_t uStack_30;
  uint32_t *puStack_28;
  uint64_t **ppuStack_20;
  uint64_t uStack_18;
  int64_t *plStack_10;
  
  plocal_var_5 = (int64_t *)*input;
  if (plocal_var_5[1] == 1) {
    if (plocal_var_5[3] == 0) {
      sub_0x044c0(*(uint64_t *)*plocal_var_5,((uint64_t *)*plocal_var_5)[1]);
    }
  }
  else if ((plocal_var_5[1] == 0) && (plocal_var_5[3] == 0)) {
    sub_0x044c0(1,0);
    return;
  }
  plocal_uvar_3 = (uint64_t *)input[1];
  plocal_var_5 = (int64_t *)(uint64_t)*(uint *)(plocal_uvar_3 + 2);
  plocal_uvar_2 = (uint64_t *)*plocal_uvar_3;
  local_var_4 = plocal_uvar_3[1] + -1;
  sub_0x04500();
  lStack_c8 = local_var_4;
  sub_0x022c8(&lStack_b8);
  if (lStack_b8 == 2) {
    puStack_c0 = puStack_b0;
    if (plocal_var_5[1] == 0) {
      sub_0x0eee8(&lStack_178,0xbbd);
      lStack_168 = lStack_178;
      uStack_160 = uStack_170;
    }
    else {
      lStack_a8 = *plocal_var_5;
      plocal_var_5[1] = plocal_var_5[1] + -1;
      *plocal_var_5 = lStack_a8 + 0x30;
      sub_0x02420(&lStack_98,lStack_a8 + 0x30,plocal_var_5);
      if (lStack_98 != 2) {
        sub_0x07428();
        plocal_uvar_3 = (uint64_t *)((int64_t)_DAT_ram_300000000 + -0xe);
        if (_DAT_ram_300000000 < plocal_uvar_3) {
          plocal_uvar_3 = (uint64_t *)0x0;
          if (_DAT_ram_300000000 == (uint64_t *)0x0) goto LAB_ram_00004908;
LAB_ram_00004888:
          if (plocal_uvar_3 < (uint64_t *)0x300000008) {
                    /* WARNING: Subroutine does not return */
            sub_0x12600(1,0xe,&DAT_ram_0001d6e0);
          }
        }
        else {
          if (_DAT_ram_300000000 != (uint64_t *)0x0) goto LAB_ram_00004888;
LAB_ram_00004908:
          plocal_uvar_3 = (uint64_t *)&DAT_ram_300007ff2;
        }
        _DAT_ram_300000000 = plocal_uvar_3;
        *(uint64_t *)((int64_t)plocal_uvar_3 + 6) = 0x6d6172676f72705f;
        *plocal_uvar_3 = 0x705f6d6574737973;
        puStack_90[2] = plocal_uvar_3;
        puStack_90[3] = 0xe;
        puStack_90[1] = 0xe;
        *puStack_90 = 1;
        plocal_uvar_2[2] = puStack_90;
        plocal_uvar_2[1] = lStack_98;
        goto LAB_ram_000049b0;
      }
      puStack_a0 = puStack_90;
      sub_0x0fb90(&uStack_30);
      if ((int)uStack_30 == 1) {
        sub_0x0d068(&lStack_168,uStack_30._4_4_,puStack_28._0_4_);
      }
      else {
        uStack_74 = uStack_18._4_4_;
        auStack_88[0] = puStack_28._0_4_;
        plStack_10 = &lStack_c8;
        uStack_18 = &puStack_a0;
        ppuStack_20 = &puStack_c0;
        puStack_28 = auStack_88;
        uStack_30 = &lStack_a8;
        sub_0x04eb0(&lStack_70,&uStack_30);
        lStack_168 = lStack_68;
        uStack_160 = uStack_60;
        if (lStack_70 != 1) {
          if (*(char *)(lStack_68 + 0x29) == '\0') {
            sub_0x0eee8(&uStack_d8,2000);
            sub_0x00c00(&lStack_e8,uStack_d8,uStack_d0,"counter",7);
            lStack_168 = lStack_e8;
            uStack_160 = uStack_e0;
          }
          else if (*(char *)(lStack_68 + 0x28) == '\0') {
            sub_0x0eee8(&uStack_f8,0x7d2);
            sub_0x00c00(&lStack_108,uStack_f8,uStack_f0,"counter",7);
            lStack_168 = lStack_108;
            uStack_160 = uStack_100;
          }
          else {
            sub_0x021c8(&lStack_70,lStack_68);
            local_uvar_1 = sub_0x10f40(&lStack_70);
            sub_0x021c8(&uStack_30,lStack_68);
            sub_0x10fb8(&iStack_40,&uStack_30);
            if (iStack_40 == 1) {
              sub_0x0d068(&uStack_158,uStack_3c,uStack_38);
              plocal_uvar_2[2] = uStack_150;
              plocal_uvar_2[1] = uStack_158;
              *plocal_uvar_2 = 0;
              sub_0x00dd8(&uStack_30);
              sub_0x00dd8(&lStack_70);
              return;
            }
            local_var_4 = sub_0x0fdd0(auStack_88,local_uvar_1,CONCAT44(uStack_34,uStack_38));
            sub_0x00dd8(&uStack_30);
            sub_0x00dd8(&lStack_70);
            if (local_var_4 == 0) {
              sub_0x0eee8(&uStack_118,0x7d5);
              sub_0x00c00(&lStack_128,uStack_118,uStack_110,"counter",7);
              lStack_168 = lStack_128;
              uStack_160 = uStack_120;
            }
            else {
              if (*(char *)((int64_t)puStack_b0 + 0x29) != '\0') {
                plocal_uvar_2[3] = puStack_90;
                plocal_uvar_2[2] = uStack_60;
                plocal_uvar_2[1] = lStack_68;
                *plocal_uvar_2 = puStack_b0;
                return;
              }
              sub_0x0eee8(&uStack_138,2000);
              sub_0x00c00(&lStack_148,uStack_138,uStack_130,"payercounter",5);
              lStack_168 = lStack_148;
              uStack_160 = uStack_140;
            }
          }
        }
      }
    }
    plocal_uvar_2[2] = uStack_160;
    plocal_uvar_2[1] = lStack_168;
    goto LAB_ram_000049b0;
  }
  sub_0x07428();
  plocal_uvar_3 = (uint64_t *)((int64_t)_DAT_ram_300000000 + -5);
  if (_DAT_ram_300000000 < plocal_uvar_3) {
    plocal_uvar_3 = (uint64_t *)0x0;
    if (_DAT_ram_300000000 == (uint64_t *)0x0) goto LAB_ram_00004740;
LAB_ram_000046c0:
    if (plocal_uvar_3 < (uint64_t *)0x300000008) {
                    /* WARNING: Subroutine does not return */
      sub_0x12600(1,5,&DAT_ram_0001d6e0);
    }
  }
  else {
    if (_DAT_ram_300000000 != (uint64_t *)0x0) goto LAB_ram_000046c0;
LAB_ram_00004740:
    plocal_uvar_3 = (uint64_t *)&DAT_ram_300007ffb;
  }
  _DAT_ram_300000000 = plocal_uvar_3;
  *(uint8_t *)((int64_t)plocal_uvar_3 + 4) = 0x72;
  *(uint32_t *)plocal_uvar_3 = 0x65796170;
  puStack_b0[2] = plocal_uvar_3;
  puStack_b0[3] = 5;
  puStack_b0[1] = 5;
  *puStack_b0 = 1;
  plocal_uvar_2[2] = puStack_b0;
  plocal_uvar_2[1] = lStack_b8;
LAB_ram_000049b0:
  *plocal_uvar_2 = 0;
  return;
}



/* Function: sub_0x044c0 @ 0x44c0 */

/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void sub_0x044c0(void)

{
  uint64_t local_uvar_1;
  uint64_t *plocal_uvar_2;
  uint64_t *plocal_uvar_3;
  int64_t local_var_4;
  int64_t *plocal_var_5;
  int64_t unaff_R6;
  int64_t lStack_178;
  uint64_t uStack_170;
  int64_t lStack_168;
  uint64_t uStack_160;
  uint64_t uStack_158;
  uint64_t uStack_150;
  int64_t lStack_148;
  uint64_t uStack_140;
  uint64_t uStack_138;
  uint64_t uStack_130;
  int64_t lStack_128;
  uint64_t uStack_120;
  uint64_t uStack_118;
  uint64_t uStack_110;
  int64_t lStack_108;
  uint64_t uStack_100;
  uint64_t uStack_f8;
  uint64_t uStack_f0;
  int64_t lStack_e8;
  uint64_t uStack_e0;
  uint64_t uStack_d8;
  uint64_t uStack_d0;
  int64_t lStack_c8;
  uint64_t *puStack_c0;
  int64_t lStack_b8;
  uint64_t *puStack_b0;
  int64_t lStack_a8;
  uint64_t *puStack_a0;
  int64_t lStack_98;
  uint64_t *puStack_90;
  uint32_t auStack_88 [5];
  uint32_t uStack_74;
  int64_t lStack_70;
  int64_t lStack_68;
  uint64_t uStack_60;
  int iStack_40;
  uint32_t uStack_3c;
  uint32_t uStack_38;
  uint32_t uStack_34;
  uint64_t uStack_30;
  uint32_t *puStack_28;
  uint64_t **ppuStack_20;
  uint64_t uStack_18;
  int64_t *plStack_10;
  
  sub_0x044c0();
  plocal_uvar_3 = *(uint64_t **)(unaff_R6 + 8);
  plocal_var_5 = (int64_t *)(uint64_t)*(uint *)(plocal_uvar_3 + 2);
  plocal_uvar_2 = (uint64_t *)*plocal_uvar_3;
  local_var_4 = plocal_uvar_3[1] + -1;
  sub_0x04500();
  lStack_c8 = local_var_4;
  sub_0x022c8(&lStack_b8);
  if (lStack_b8 == 2) {
    puStack_c0 = puStack_b0;
    if (plocal_var_5[1] == 0) {
      sub_0x0eee8(&lStack_178,0xbbd);
      lStack_168 = lStack_178;
      uStack_160 = uStack_170;
    }
    else {
      lStack_a8 = *plocal_var_5;
      plocal_var_5[1] = plocal_var_5[1] + -1;
      *plocal_var_5 = lStack_a8 + 0x30;
      sub_0x02420(&lStack_98,lStack_a8 + 0x30,plocal_var_5);
      if (lStack_98 != 2) {
        sub_0x07428();
        plocal_uvar_3 = (uint64_t *)((int64_t)_DAT_ram_300000000 + -0xe);
        if (_DAT_ram_300000000 < plocal_uvar_3) {
          plocal_uvar_3 = (uint64_t *)0x0;
          if (_DAT_ram_300000000 == (uint64_t *)0x0) goto LAB_ram_00004908;
LAB_ram_00004888:
          if (plocal_uvar_3 < (uint64_t *)0x300000008) {
                    /* WARNING: Subroutine does not return */
            sub_0x12600(1,0xe,&DAT_ram_0001d6e0);
          }
        }
        else {
          if (_DAT_ram_300000000 != (uint64_t *)0x0) goto LAB_ram_00004888;
LAB_ram_00004908:
          plocal_uvar_3 = (uint64_t *)&DAT_ram_300007ff2;
        }
        _DAT_ram_300000000 = plocal_uvar_3;
        *(uint64_t *)((int64_t)plocal_uvar_3 + 6) = 0x6d6172676f72705f;
        *plocal_uvar_3 = 0x705f6d6574737973;
        puStack_90[2] = plocal_uvar_3;
        puStack_90[3] = 0xe;
        puStack_90[1] = 0xe;
        *puStack_90 = 1;
        plocal_uvar_2[2] = puStack_90;
        plocal_uvar_2[1] = lStack_98;
        goto LAB_ram_000049b0;
      }
      puStack_a0 = puStack_90;
      sub_0x0fb90(&uStack_30);
      if ((int)uStack_30 == 1) {
        sub_0x0d068(&lStack_168,uStack_30._4_4_,puStack_28._0_4_);
      }
      else {
        uStack_74 = uStack_18._4_4_;
        auStack_88[0] = puStack_28._0_4_;
        plStack_10 = &lStack_c8;
        uStack_18 = &puStack_a0;
        ppuStack_20 = &puStack_c0;
        puStack_28 = auStack_88;
        uStack_30 = &lStack_a8;
        sub_0x04eb0(&lStack_70,&uStack_30);
        lStack_168 = lStack_68;
        uStack_160 = uStack_60;
        if (lStack_70 != 1) {
          if (*(char *)(lStack_68 + 0x29) == '\0') {
            sub_0x0eee8(&uStack_d8,2000);
            sub_0x00c00(&lStack_e8,uStack_d8,uStack_d0,"counter",7);
            lStack_168 = lStack_e8;
            uStack_160 = uStack_e0;
          }
          else if (*(char *)(lStack_68 + 0x28) == '\0') {
            sub_0x0eee8(&uStack_f8,0x7d2);
            sub_0x00c00(&lStack_108,uStack_f8,uStack_f0,"counter",7);
            lStack_168 = lStack_108;
            uStack_160 = uStack_100;
          }
          else {
            sub_0x021c8(&lStack_70,lStack_68);
            local_uvar_1 = sub_0x10f40(&lStack_70);
            sub_0x021c8(&uStack_30,lStack_68);
            sub_0x10fb8(&iStack_40,&uStack_30);
            if (iStack_40 == 1) {
              sub_0x0d068(&uStack_158,uStack_3c,uStack_38);
              plocal_uvar_2[2] = uStack_150;
              plocal_uvar_2[1] = uStack_158;
              *plocal_uvar_2 = 0;
              sub_0x00dd8(&uStack_30);
              sub_0x00dd8(&lStack_70);
              return;
            }
            local_var_4 = sub_0x0fdd0(auStack_88,local_uvar_1,CONCAT44(uStack_34,uStack_38));
            sub_0x00dd8(&uStack_30);
            sub_0x00dd8(&lStack_70);
            if (local_var_4 == 0) {
              sub_0x0eee8(&uStack_118,0x7d5);
              sub_0x00c00(&lStack_128,uStack_118,uStack_110,"counter",7);
              lStack_168 = lStack_128;
              uStack_160 = uStack_120;
            }
            else {
              if (*(char *)((int64_t)puStack_b0 + 0x29) != '\0') {
                plocal_uvar_2[3] = puStack_90;
                plocal_uvar_2[2] = uStack_60;
                plocal_uvar_2[1] = lStack_68;
                *plocal_uvar_2 = puStack_b0;
                return;
              }
              sub_0x0eee8(&uStack_138,2000);
              sub_0x00c00(&lStack_148,uStack_138,uStack_130,"payercounter",5);
              lStack_168 = lStack_148;
              uStack_160 = uStack_140;
            }
          }
        }
      }
    }
    plocal_uvar_2[2] = uStack_160;
    plocal_uvar_2[1] = lStack_168;
    goto LAB_ram_000049b0;
  }
  sub_0x07428();
  plocal_uvar_3 = (uint64_t *)((int64_t)_DAT_ram_300000000 + -5);
  if (_DAT_ram_300000000 < plocal_uvar_3) {
    plocal_uvar_3 = (uint64_t *)0x0;
    if (_DAT_ram_300000000 == (uint64_t *)0x0) goto LAB_ram_00004740;
LAB_ram_000046c0:
    if (plocal_uvar_3 < (uint64_t *)0x300000008) {
                    /* WARNING: Subroutine does not return */
      sub_0x12600(1,5,&DAT_ram_0001d6e0);
    }
  }
  else {
    if (_DAT_ram_300000000 != (uint64_t *)0x0) goto LAB_ram_000046c0;
LAB_ram_00004740:
    plocal_uvar_3 = (uint64_t *)&DAT_ram_300007ffb;
  }
  _DAT_ram_300000000 = plocal_uvar_3;
  *(uint8_t *)((int64_t)plocal_uvar_3 + 4) = 0x72;
  *(uint32_t *)plocal_uvar_3 = 0x65796170;
  puStack_b0[2] = plocal_uvar_3;
  puStack_b0[3] = 5;
  puStack_b0[1] = 5;
  *puStack_b0 = 1;
  plocal_uvar_2[2] = puStack_b0;
  plocal_uvar_2[1] = lStack_b8;
LAB_ram_000049b0:
  *plocal_uvar_2 = 0;
  return;
}



/* Function: sub_0x04500 @ 0x4500 */

/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void sub_0x04500(uint64_t *input,uint64_t param_2,int64_t *param_3)

{
  uint64_t local_uvar_1;
  int64_t local_var_2;
  uint64_t *plocal_uvar_3;
  int64_t lStack_178;
  uint64_t uStack_170;
  int64_t lStack_168;
  uint64_t uStack_160;
  uint64_t uStack_158;
  uint64_t uStack_150;
  int64_t lStack_148;
  uint64_t uStack_140;
  uint64_t uStack_138;
  uint64_t uStack_130;
  int64_t lStack_128;
  uint64_t uStack_120;
  uint64_t uStack_118;
  uint64_t uStack_110;
  int64_t lStack_108;
  uint64_t uStack_100;
  uint64_t uStack_f8;
  uint64_t uStack_f0;
  int64_t lStack_e8;
  uint64_t uStack_e0;
  uint64_t uStack_d8;
  uint64_t uStack_d0;
  uint64_t uStack_c8;
  uint64_t *puStack_c0;
  int64_t lStack_b8;
  uint64_t *puStack_b0;
  int64_t lStack_a8;
  uint64_t *puStack_a0;
  int64_t lStack_98;
  uint64_t *puStack_90;
  uint32_t auStack_88 [5];
  uint32_t uStack_74;
  int64_t lStack_70;
  int64_t lStack_68;
  uint64_t uStack_60;
  int iStack_40;
  uint32_t uStack_3c;
  uint32_t uStack_38;
  uint32_t uStack_34;
  uint64_t uStack_30;
  uint32_t *puStack_28;
  uint64_t **ppuStack_20;
  uint64_t uStack_18;
  uint64_t *puStack_10;
  
  sub_0x04500();
  uStack_c8 = param_2;
  sub_0x022c8(&lStack_b8);
  if (lStack_b8 == 2) {
    puStack_c0 = puStack_b0;
    if (param_3[1] == 0) {
      sub_0x0eee8(&lStack_178,0xbbd);
      lStack_168 = lStack_178;
      uStack_160 = uStack_170;
    }
    else {
      lStack_a8 = *param_3;
      param_3[1] = param_3[1] + -1;
      *param_3 = lStack_a8 + 0x30;
      sub_0x02420(&lStack_98,lStack_a8 + 0x30,param_3);
      if (lStack_98 != 2) {
        sub_0x07428();
        plocal_uvar_3 = (uint64_t *)((int64_t)_DAT_ram_300000000 + -0xe);
        if (_DAT_ram_300000000 < plocal_uvar_3) {
          plocal_uvar_3 = (uint64_t *)0x0;
          if (_DAT_ram_300000000 == (uint64_t *)0x0) goto LAB_ram_00004908;
LAB_ram_00004888:
          if (plocal_uvar_3 < (uint64_t *)0x300000008) {
                    /* WARNING: Subroutine does not return */
            sub_0x12600(1,0xe,&DAT_ram_0001d6e0);
          }
        }
        else {
          if (_DAT_ram_300000000 != (uint64_t *)0x0) goto LAB_ram_00004888;
LAB_ram_00004908:
          plocal_uvar_3 = (uint64_t *)&DAT_ram_300007ff2;
        }
        _DAT_ram_300000000 = plocal_uvar_3;
        *(uint64_t *)((int64_t)plocal_uvar_3 + 6) = 0x6d6172676f72705f;
        *plocal_uvar_3 = 0x705f6d6574737973;
        puStack_90[2] = plocal_uvar_3;
        puStack_90[3] = 0xe;
        puStack_90[1] = 0xe;
        *puStack_90 = 1;
        input[2] = puStack_90;
        input[1] = lStack_98;
        goto LAB_ram_000049b0;
      }
      puStack_a0 = puStack_90;
      sub_0x0fb90(&uStack_30);
      if ((int)uStack_30 == 1) {
        sub_0x0d068(&lStack_168,uStack_30._4_4_,puStack_28._0_4_);
      }
      else {
        uStack_74 = uStack_18._4_4_;
        auStack_88[0] = puStack_28._0_4_;
        puStack_10 = &uStack_c8;
        uStack_18 = &puStack_a0;
        ppuStack_20 = &puStack_c0;
        puStack_28 = auStack_88;
        uStack_30 = &lStack_a8;
        sub_0x04eb0(&lStack_70,&uStack_30);
        lStack_168 = lStack_68;
        uStack_160 = uStack_60;
        if (lStack_70 != 1) {
          if (*(char *)(lStack_68 + 0x29) == '\0') {
            sub_0x0eee8(&uStack_d8,2000);
            sub_0x00c00(&lStack_e8,uStack_d8,uStack_d0,"counter",7);
            lStack_168 = lStack_e8;
            uStack_160 = uStack_e0;
          }
          else if (*(char *)(lStack_68 + 0x28) == '\0') {
            sub_0x0eee8(&uStack_f8,0x7d2);
            sub_0x00c00(&lStack_108,uStack_f8,uStack_f0,"counter",7);
            lStack_168 = lStack_108;
            uStack_160 = uStack_100;
          }
          else {
            sub_0x021c8(&lStack_70,lStack_68);
            local_uvar_1 = sub_0x10f40(&lStack_70);
            sub_0x021c8(&uStack_30,lStack_68);
            sub_0x10fb8(&iStack_40,&uStack_30);
            if (iStack_40 == 1) {
              sub_0x0d068(&uStack_158,uStack_3c,uStack_38);
              input[2] = uStack_150;
              input[1] = uStack_158;
              *input = 0;
              sub_0x00dd8(&uStack_30);
              sub_0x00dd8(&lStack_70);
              return;
            }
            local_var_2 = sub_0x0fdd0(auStack_88,local_uvar_1,CONCAT44(uStack_34,uStack_38));
            sub_0x00dd8(&uStack_30);
            sub_0x00dd8(&lStack_70);
            if (local_var_2 == 0) {
              sub_0x0eee8(&uStack_118,0x7d5);
              sub_0x00c00(&lStack_128,uStack_118,uStack_110,"counter",7);
              lStack_168 = lStack_128;
              uStack_160 = uStack_120;
            }
            else {
              if (*(char *)((int64_t)puStack_b0 + 0x29) != '\0') {
                input[3] = puStack_90;
                input[2] = uStack_60;
                input[1] = lStack_68;
                *input = puStack_b0;
                return;
              }
              sub_0x0eee8(&uStack_138,2000);
              sub_0x00c00(&lStack_148,uStack_138,uStack_130,"payercounter",5);
              lStack_168 = lStack_148;
              uStack_160 = uStack_140;
            }
          }
        }
      }
    }
    input[2] = uStack_160;
    input[1] = lStack_168;
    goto LAB_ram_000049b0;
  }
  sub_0x07428();
  plocal_uvar_3 = (uint64_t *)((int64_t)_DAT_ram_300000000 + -5);
  if (_DAT_ram_300000000 < plocal_uvar_3) {
    plocal_uvar_3 = (uint64_t *)0x0;
    if (_DAT_ram_300000000 == (uint64_t *)0x0) goto LAB_ram_00004740;
LAB_ram_000046c0:
    if (plocal_uvar_3 < (uint64_t *)0x300000008) {
                    /* WARNING: Subroutine does not return */
      sub_0x12600(1,5,&DAT_ram_0001d6e0);
    }
  }
  else {
    if (_DAT_ram_300000000 != (uint64_t *)0x0) goto LAB_ram_000046c0;
LAB_ram_00004740:
    plocal_uvar_3 = (uint64_t *)&DAT_ram_300007ffb;
  }
  _DAT_ram_300000000 = plocal_uvar_3;
  *(uint8_t *)((int64_t)plocal_uvar_3 + 4) = 0x72;
  *(uint32_t *)plocal_uvar_3 = 0x65796170;
  puStack_b0[2] = plocal_uvar_3;
  puStack_b0[3] = 5;
  puStack_b0[1] = 5;
  *puStack_b0 = 1;
  input[2] = puStack_b0;
  input[1] = lStack_b8;
LAB_ram_000049b0:
  *input = 0;
  return;
}



/* Function: sub_0x04508 @ 0x4508 */

/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void sub_0x04508(uint64_t *input,uint64_t param_2,int64_t *param_3)

{
  uint64_t local_uvar_1;
  int64_t local_var_2;
  uint64_t *plocal_uvar_3;
  int64_t local_178;
  uint64_t local_170;
  int64_t local_168;
  uint64_t local_160;
  uint64_t local_158;
  uint64_t local_150;
  int64_t local_148;
  uint64_t local_140;
  uint64_t local_138;
  uint64_t local_130;
  int64_t local_128;
  uint64_t local_120;
  uint64_t local_118;
  uint64_t local_110;
  int64_t local_108;
  uint64_t local_100;
  uint64_t local_f8;
  uint64_t local_f0;
  int64_t local_e8;
  uint64_t local_e0;
  uint64_t local_d8;
  uint64_t local_d0;
  uint64_t local_c8;
  uint64_t *local_c0;
  int64_t local_b8;
  uint64_t *local_b0;
  int64_t local_a8;
  uint64_t *local_a0;
  int64_t local_98;
  uint64_t *local_90;
  uint32_t local_88 [5];
  uint32_t local_74;
  int64_t local_70;
  int64_t local_68;
  uint64_t local_60;
  int local_40;
  uint32_t local_3c;
  uint32_t local_38;
  uint32_t uStack_34;
  uint64_t local_30;
  uint32_t *local_28;
  uint64_t **ppuStack_20;
  uint64_t uStack_18;
  uint64_t *local_10;
  
  local_c8 = param_2;
  sub_0x022c8(&local_b8);
  if (local_b8 == 2) {
    local_c0 = local_b0;
    if (param_3[1] == 0) {
      sub_0x0eee8(&local_178,0xbbd);
      local_168 = local_178;
      local_160 = local_170;
    }
    else {
      local_a8 = *param_3;
      param_3[1] = param_3[1] + -1;
      *param_3 = local_a8 + 0x30;
      sub_0x02420(&local_98,local_a8 + 0x30,param_3);
      if (local_98 != 2) {
        sub_0x07428();
        plocal_uvar_3 = (uint64_t *)((int64_t)_DAT_ram_300000000 + -0xe);
        if (_DAT_ram_300000000 < plocal_uvar_3) {
          plocal_uvar_3 = (uint64_t *)0x0;
          if (_DAT_ram_300000000 == (uint64_t *)0x0) goto LAB_ram_00004908;
LAB_ram_00004888:
          if (plocal_uvar_3 < (uint64_t *)0x300000008) {
                    /* WARNING: Subroutine does not return */
            sub_0x12600(1,0xe,&DAT_ram_0001d6e0);
          }
        }
        else {
          if (_DAT_ram_300000000 != (uint64_t *)0x0) goto LAB_ram_00004888;
LAB_ram_00004908:
          plocal_uvar_3 = (uint64_t *)&DAT_ram_300007ff2;
        }
        _DAT_ram_300000000 = plocal_uvar_3;
        *(uint64_t *)((int64_t)plocal_uvar_3 + 6) = 0x6d6172676f72705f;
        *plocal_uvar_3 = 0x705f6d6574737973;
        local_90[2] = plocal_uvar_3;
        local_90[3] = 0xe;
        local_90[1] = 0xe;
        *local_90 = 1;
        input[2] = local_90;
        input[1] = local_98;
        goto LAB_ram_000049b0;
      }
      local_a0 = local_90;
      sub_0x0fb90(&local_30);
      if ((int)local_30 == 1) {
        sub_0x0d068(&local_168,local_30._4_4_,local_28._0_4_);
      }
      else {
        local_74 = uStack_18._4_4_;
        local_88[0] = local_28._0_4_;
        local_10 = &local_c8;
        uStack_18 = &local_a0;
        ppuStack_20 = &local_c0;
        local_28 = local_88;
        local_30 = &local_a8;
        sub_0x04eb0(&local_70,&local_30);
        local_168 = local_68;
        local_160 = local_60;
        if (local_70 != 1) {
          if (*(char *)(local_68 + 0x29) == '\0') {
            sub_0x0eee8(&local_d8,2000);
            sub_0x00c00(&local_e8,local_d8,local_d0,"counter",7);
            local_168 = local_e8;
            local_160 = local_e0;
          }
          else if (*(char *)(local_68 + 0x28) == '\0') {
            sub_0x0eee8(&local_f8,0x7d2);
            sub_0x00c00(&local_108,local_f8,local_f0,"counter",7);
            local_168 = local_108;
            local_160 = local_100;
          }
          else {
            sub_0x021c8(&local_70,local_68);
            local_uvar_1 = sub_0x10f40(&local_70);
            sub_0x021c8(&local_30,local_68);
            sub_0x10fb8(&local_40,&local_30);
            if (local_40 == 1) {
              sub_0x0d068(&local_158,local_3c,local_38);
              input[2] = local_150;
              input[1] = local_158;
              *input = 0;
              sub_0x00dd8(&local_30);
              sub_0x00dd8(&local_70);
              return;
            }
            local_var_2 = sub_0x0fdd0(local_88,local_uvar_1,CONCAT44(uStack_34,local_38));
            sub_0x00dd8(&local_30);
            sub_0x00dd8(&local_70);
            if (local_var_2 == 0) {
              sub_0x0eee8(&local_118,0x7d5);
              sub_0x00c00(&local_128,local_118,local_110,"counter",7);
              local_168 = local_128;
              local_160 = local_120;
            }
            else {
              if (*(char *)((int64_t)local_b0 + 0x29) != '\0') {
                input[3] = local_90;
                input[2] = local_60;
                input[1] = local_68;
                *input = local_b0;
                return;
              }
              sub_0x0eee8(&local_138,2000);
              sub_0x00c00(&local_148,local_138,local_130,"payercounter",5);
              local_168 = local_148;
              local_160 = local_140;
            }
          }
        }
      }
    }
    input[2] = local_160;
    input[1] = local_168;
    goto LAB_ram_000049b0;
  }
  sub_0x07428();
  plocal_uvar_3 = (uint64_t *)((int64_t)_DAT_ram_300000000 + -5);
  if (_DAT_ram_300000000 < plocal_uvar_3) {
    plocal_uvar_3 = (uint64_t *)0x0;
    if (_DAT_ram_300000000 == (uint64_t *)0x0) goto LAB_ram_00004740;
LAB_ram_000046c0:
    if (plocal_uvar_3 < (uint64_t *)0x300000008) {
                    /* WARNING: Subroutine does not return */
      sub_0x12600(1,5,&DAT_ram_0001d6e0);
    }
  }
  else {
    if (_DAT_ram_300000000 != (uint64_t *)0x0) goto LAB_ram_000046c0;
LAB_ram_00004740:
    plocal_uvar_3 = (uint64_t *)&DAT_ram_300007ffb;
  }
  _DAT_ram_300000000 = plocal_uvar_3;
  *(uint8_t *)((int64_t)plocal_uvar_3 + 4) = 0x72;
  *(uint32_t *)plocal_uvar_3 = 0x65796170;
  local_b0[2] = plocal_uvar_3;
  local_b0[3] = 5;
  local_b0[1] = 5;
  *local_b0 = 1;
  input[2] = local_b0;
  input[1] = local_b8;
LAB_ram_000049b0:
  *input = 0;
  return;
}



/* Function: sub_0x04eb0 @ 0x4eb0 */

/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void sub_0x04eb0(uint64_t *input,uint64_t *param_2)

{
  uint8_t local_uvar_1;
  uint8_t local_uvar_2;
  uint8_t local_uvar_3;
  bool is_valid_4;
  char *pcVar5;
  int64_t *plocal_var_6;
  int64_t *plocal_var_7;
  int64_t local_var_8;
  uint32_t *plocal_uvar_9;
  int64_t *plocal_var_10;
  uint64_t **pplocal_uvar_11;
  uint64_t local_uvar_12;
  uint64_t local_uvar_13;
  uint64_t local_uvar_14;
  int64_t *plocal_var_15;
  int64_t local_var_16;
  int64_t *plocal_var_17;
  uint64_t *plocal_uvar_18;
  uint64_t *plocal_uvar_19;
  int64_t *plocal_var_20;
  uint64_t local_uvar_21;
  uint64_t local_uvar_22;
  int64_t *plocal_var_23;
  int64_t *plocal_var_24;
  int64_t local_200;
  uint64_t local_1f8;
  uint64_t local_1f0;
  uint64_t local_1e8;
  uint64_t local_1e0;
  uint64_t local_1d8;
  int64_t local_1d0;
  uint64_t local_1c8;
  int64_t local_1c0;
  uint64_t local_1b8;
  int64_t local_1b0;
  uint64_t local_1a8;
  uint64_t *local_1a0;
  char *local_198;
  uint64_t *local_190;
  int64_t local_188;
  int64_t *local_180;
  int64_t *local_178;
  int64_t local_170;
  int64_t local_168;
  int64_t local_160;
  int64_t *local_158;
  int64_t *local_150;
  int64_t *local_148;
  uint64_t local_140;
  uint64_t local_138;
  uint64_t local_130;
  uint64_t local_128;
  uint64_t local_120;
  uint64_t local_118;
  uint64_t local_110;
  uint64_t local_108;
  uint64_t local_100;
  uint64_t *local_f8;
  uint8_t *local_f0;
  int64_t local_e8;
  int64_t local_e0;
  uint64_t local_d8;
  uint64_t local_d0;
  uint64_t local_c8;
  uint64_t local_c0;
  uint64_t local_b8;
  uint64_t local_b0;
  uint64_t local_a8;
  int64_t *local_a0;
  int64_t *local_98;
  uint64_t local_90;
  uint64_t local_88;
  uint8_t local_80;
  uint8_t local_7f;
  uint8_t local_7e;
  int64_t *local_78;
  int64_t *local_70;
  int64_t *local_68;
  uint64_t local_60;
  uint64_t local_58;
  uint8_t local_50;
  uint8_t local_4f;
  uint8_t local_4e;
  uint64_t local_48;
  uint64_t local_40;
  uint64_t local_38;
  uint64_t local_30;
  uint64_t local_28;
  uint64_t local_20;
  uint64_t local_18;
  int64_t local_10;
  int64_t *local_8;
  
  plocal_var_23 = (int64_t *)*param_2;
  plocal_var_6 = (int64_t *)sub_0x10f40(*plocal_var_23);
  if (plocal_var_6 == (int64_t *)0x0) {
    local_uvar_12 = sub_0x0fc40(param_2[1],0x10);
    plocal_uvar_19 = *(uint64_t **)param_2[2];
    plocal_var_6 = (int64_t *)plocal_uvar_19[1];
    local_var_8 = *plocal_var_6;
    local_uvar_13 = *plocal_uvar_19;
    *plocal_var_6 = local_var_8 + 1;
    if (local_var_8 + 1 != 0) {
      plocal_var_7 = (int64_t *)plocal_uvar_19[2];
      local_var_8 = *plocal_var_7;
      *plocal_var_7 = local_var_8 + 1;
      if (local_var_8 + 1 != 0) {
        plocal_uvar_18 = (uint64_t *)*plocal_var_23;
        plocal_var_15 = (int64_t *)plocal_uvar_18[1];
        local_var_8 = *plocal_var_15;
        local_uvar_1 = *(uint8_t *)((int64_t)plocal_uvar_19 + 0x2a);
        local_uvar_2 = *(uint8_t *)((int64_t)plocal_uvar_19 + 0x29);
        local_uvar_3 = *(uint8_t *)(plocal_uvar_19 + 5);
        local_uvar_21 = plocal_uvar_19[4];
        local_uvar_14 = plocal_uvar_19[3];
        local_uvar_22 = *plocal_uvar_18;
        *plocal_var_15 = local_var_8 + 1;
        if (local_var_8 + 1 != 0) {
          plocal_var_10 = (int64_t *)plocal_uvar_18[2];
          local_var_8 = *plocal_var_10;
          *plocal_var_10 = local_var_8 + 1;
          if (local_var_8 + 1 != 0) {
            local_140 = plocal_uvar_18[3];
            local_138 = plocal_uvar_18[4];
            plocal_uvar_19 = (uint64_t *)**(uint64_t **)param_2[3];
            local_100 = plocal_uvar_19[3];
            local_108 = plocal_uvar_19[2];
            local_110 = plocal_uvar_19[1];
            local_118 = *plocal_uvar_19;
            local_130 = CONCAT71(CONCAT61(CONCAT51(local_130._3_5_,
                                                   *(uint8_t *)((int64_t)plocal_uvar_18 + 0x2a)),
                                          *(uint8_t *)((int64_t)plocal_uvar_18 + 0x29)),
                                 *(uint8_t *)(plocal_uvar_18 + 5));
            local_160 = CONCAT71(CONCAT61(CONCAT51(local_160._3_5_,local_uvar_1),local_uvar_2),local_uvar_3);
            local_120 = 0;
            local_128 = 8;
            local_190 = (uint64_t *)0x0;
            local_198 = (char *)0x8;
            local_1a0 = (uint64_t *)0x0;
            local_188 = local_uvar_13;
            local_180 = plocal_var_6;
            local_178 = plocal_var_7;
            local_170 = local_uvar_14;
            local_168 = local_uvar_21;
            local_158 = (int64_t *)local_uvar_22;
            local_150 = plocal_var_15;
            local_148 = plocal_var_10;
            sub_0x07cc0(&local_200,&local_1a0,local_uvar_12,0x10,*(uint64_t *)param_2[4]);
            local_1c0 = local_200;
            local_1b8 = local_1f8;
joined_r0x00005b38:
            if (local_1c0 == 2) {
              sub_0x00120(&local_1a0,*plocal_var_23);
              plocal_uvar_19 = local_190;
              pcVar5 = local_198;
              if (local_1a0 == (uint64_t *)0x0) {
                input[2] = local_190;
                input[1] = local_198;
                *input = 0;
                return;
              }
              sub_0x07428();
              plocal_uvar_9 = (uint32_t *)((int64_t)_DAT_ram_300000000 + -7);
              if (_DAT_ram_300000000 < plocal_uvar_9) {
                plocal_uvar_9 = (uint32_t *)0x0;
              }
              if (_DAT_ram_300000000 == (uint32_t *)0x0) {
                plocal_uvar_9 = (uint32_t *)&DAT_ram_300007ff9;
              }
              if ((uint32_t *)0x300000007 < plocal_uvar_9) {
                _DAT_ram_300000000 = plocal_uvar_9;
                *(uint32_t *)((int64_t)plocal_uvar_9 + 3) = 0x7265746e;
                *plocal_uvar_9 = 0x6e756f63;
                plocal_uvar_19[2] = plocal_uvar_9;
                plocal_uvar_19[3] = 7;
                plocal_uvar_19[1] = 7;
                *plocal_uvar_19 = 1;
                input[2] = plocal_uvar_19;
                input[1] = pcVar5;
                *input = 1;
                return;
              }
                    /* WARNING: Subroutine does not return */
              sub_0x12600(1,7,&DAT_ram_0001d6e0);
            }
LAB_ram_00005ed8:
            input[1] = local_1c0;
            input[2] = local_1b8;
            *input = 1;
            return;
          }
        }
      }
    }
code_r0x00006030:
    sub_0x06030();
  }
  else {
    plocal_uvar_19 = (uint64_t *)param_2[2];
    plocal_var_7 = *(int64_t **)*plocal_uvar_19;
    local_e0 = plocal_var_7[3];
    local_e8 = plocal_var_7[2];
    local_f0 = (uint8_t *)plocal_var_7[1];
    local_f8 = (uint64_t *)*plocal_var_7;
    plocal_var_7 = *(int64_t **)*plocal_var_23;
    local_188 = plocal_var_7[3];
    local_190 = (uint64_t *)plocal_var_7[2];
    local_198 = (char *)plocal_var_7[1];
    local_1a0 = (uint64_t *)*plocal_var_7;
    if ((((local_f8 != local_1a0) || (local_f0 != local_198)) ||
        ((uint64_t *)local_e8 != local_190)) || (is_valid_4 = false, local_e0 != local_188)) {
      is_valid_4 = true;
    }
    if (is_valid_4) {
      plocal_var_7 = (int64_t *)sub_0x0fc40(param_2[1],0x10);
      if (plocal_var_7 < (int64_t *)0x2) {
        plocal_var_7 = (int64_t *)0x1;
      }
      plocal_var_15 = plocal_var_6;
      if (plocal_var_6 < plocal_var_7) {
        plocal_uvar_19 = (uint64_t *)*plocal_uvar_19;
        plocal_var_10 = (int64_t *)plocal_uvar_19[1];
        local_var_8 = *plocal_var_10;
        local_uvar_12 = *plocal_uvar_19;
        *plocal_var_10 = local_var_8 + 1;
        if (local_var_8 + 1 != 0) {
          plocal_var_17 = (int64_t *)plocal_uvar_19[2];
          local_var_8 = *plocal_var_17;
          *plocal_var_17 = local_var_8 + 1;
          if (local_var_8 + 1 != 0) {
            plocal_uvar_18 = (uint64_t *)*plocal_var_23;
            plocal_var_24 = (int64_t *)plocal_uvar_18[1];
            local_var_8 = *plocal_var_24;
            local_uvar_1 = *(uint8_t *)((int64_t)plocal_uvar_19 + 0x2a);
            local_uvar_2 = *(uint8_t *)((int64_t)plocal_uvar_19 + 0x29);
            local_uvar_3 = *(uint8_t *)(plocal_uvar_19 + 5);
            local_uvar_13 = plocal_uvar_19[4];
            local_uvar_14 = plocal_uvar_19[3];
            plocal_var_15 = (int64_t *)*plocal_uvar_18;
            *plocal_var_24 = local_var_8 + 1;
            if (local_var_8 + 1 != 0) {
              plocal_var_20 = (int64_t *)plocal_uvar_18[2];
              local_var_8 = *plocal_var_20;
              *plocal_var_20 = local_var_8 + 1;
              if (local_var_8 + 1 != 0) {
                plocal_uvar_19 = (uint64_t *)**(int64_t **)param_2[3];
                local_38 = *plocal_uvar_19;
                local_30 = plocal_uvar_19[1];
                local_28 = plocal_uvar_19[2];
                local_20 = plocal_uvar_19[3];
                local_4e = *(uint8_t *)((int64_t)plocal_uvar_18 + 0x2a);
                local_4f = *(uint8_t *)((int64_t)plocal_uvar_18 + 0x29);
                local_50 = *(uint8_t *)(plocal_uvar_18 + 5);
                local_58 = plocal_uvar_18[4];
                local_60 = plocal_uvar_18[3];
                local_40 = 0;
                local_48 = 8;
                local_b0 = 0;
                local_b8 = 8;
                local_c0 = 0;
                local_a8 = local_uvar_12;
                local_a0 = plocal_var_10;
                local_98 = plocal_var_17;
                local_90 = local_uvar_14;
                local_88 = local_uvar_13;
                local_80 = local_uvar_3;
                local_7f = local_uvar_2;
                local_7e = local_uvar_1;
                local_78 = plocal_var_15;
                local_70 = plocal_var_24;
                local_68 = plocal_var_20;
                sub_0x080c0(&local_1b0,&local_c0,(int64_t)plocal_var_7 - (int64_t)plocal_var_6);
                if (local_1b0 != 2) {
                  input[1] = local_1b0;
                  input[2] = local_1a8;
                  *input = 1;
                  return;
                }
                goto LAB_ram_000053e8;
              }
            }
          }
        }
      }
      else {
LAB_ram_000053e8:
        plocal_var_10 = (int64_t *)*plocal_var_23;
        plocal_var_7 = (int64_t *)plocal_var_10[1];
        local_var_16 = *plocal_var_7;
        local_var_8 = *plocal_var_10;
        *plocal_var_7 = local_var_16 + 1;
        plocal_var_6 = plocal_var_15;
        if (local_var_16 + 1 != 0) {
          plocal_var_15 = (int64_t *)plocal_var_10[2];
          local_var_16 = *plocal_var_15;
          *plocal_var_15 = local_var_16 + 1;
          if (local_var_16 + 1 != 0) {
            local_170 = plocal_var_10[3];
            local_168 = plocal_var_10[4];
            plocal_var_6 = (int64_t *)(uint64_t)*(byte *)((int64_t)plocal_var_10 + 0x29);
            plocal_uvar_19 = (uint64_t *)param_2[3];
            plocal_uvar_18 = *(uint64_t **)*plocal_uvar_19;
            local_130 = plocal_uvar_18[3];
            local_138 = plocal_uvar_18[2];
            local_140 = plocal_uvar_18[1];
            local_148 = (int64_t *)*plocal_uvar_18;
            local_160 = CONCAT71(CONCAT61(CONCAT51(local_160._3_5_,
                                                   *(uint8_t *)((int64_t)plocal_var_10 + 0x2a)),
                                          *(byte *)((int64_t)plocal_var_10 + 0x29)),(char)plocal_var_10[5]);
            local_150 = (int64_t *)0x0;
            local_158 = (int64_t *)0x8;
            local_190 = (uint64_t *)0x0;
            local_198 = (uint8_t *)0x8;
            local_1a0 = (uint64_t *)0x0;
            local_188 = local_var_8;
            local_180 = plocal_var_7;
            local_178 = plocal_var_15;
            sub_0x07640(&local_1c0,&local_1a0,0x10);
            if (local_1c0 != 2) goto LAB_ram_00005ed8;
            plocal_uvar_18 = (uint64_t *)*plocal_var_23;
            plocal_var_7 = (int64_t *)plocal_uvar_18[1];
            local_var_8 = *plocal_var_7;
            local_uvar_12 = *plocal_uvar_18;
            *plocal_var_7 = local_var_8 + 1;
            if (local_var_8 + 1 != 0) {
              plocal_var_15 = (int64_t *)plocal_uvar_18[2];
              local_var_8 = *plocal_var_15;
              *plocal_var_15 = local_var_8 + 1;
              if (local_var_8 + 1 != 0) {
                local_170 = plocal_uvar_18[3];
                local_168 = plocal_uvar_18[4];
                plocal_uvar_19 = *(uint64_t **)*plocal_uvar_19;
                local_130 = plocal_uvar_19[3];
                local_138 = plocal_uvar_19[2];
                local_140 = plocal_uvar_19[1];
                local_148 = (int64_t *)*plocal_uvar_19;
                local_160 = CONCAT71(CONCAT61(CONCAT51(local_160._3_5_,
                                                       *(uint8_t *)((int64_t)plocal_uvar_18 + 0x2a)),
                                              *(uint8_t *)((int64_t)plocal_uvar_18 + 0x29)),
                                     *(uint8_t *)(plocal_uvar_18 + 5));
                local_150 = (int64_t *)0x0;
                local_158 = (int64_t *)0x8;
                local_190 = (uint64_t *)0x0;
                local_198 = (char *)0x8;
                local_1a0 = (uint64_t *)0x0;
                local_188 = local_uvar_12;
                local_180 = plocal_var_7;
                local_178 = plocal_var_15;
                sub_0x07980(&local_1d0,&local_1a0,*(uint64_t *)param_2[4]);
                local_1c0 = local_1d0;
                local_1b8 = local_1c8;
                goto joined_r0x00005b38;
              }
            }
          }
        }
      }
      goto code_r0x00006030;
    }
    sub_0x0e260(&local_d8,&DAT_ram_0001a5fc);
    local_8 = (int64_t *)0x0;
    local_10 = 1;
    local_18 = 0;
    local_f0 = &DAT_ram_0001d640;
    local_f8 = &local_18;
    local_e8 = 0xe0000020;
    local_var_8 = sub_0x0f138(&DAT_ram_0001a5fc,&local_f8);
    if (local_var_8 == 0) {
      local_158 = local_8;
      local_160 = local_10;
      local_168 = local_18;
      local_180 = (int64_t *)local_d8;
      local_178 = (int64_t *)local_d0;
      local_170 = local_c8;
      local_198 = "programs/counter_anchor/src/lib.rsfailed to write whole buffer";
      local_108 = CONCAT44(local_108._4_4_,0x1005);
      local_150 = (int64_t *)CONCAT71(local_150._1_7_,2);
      local_188 = CONCAT44(local_188._4_4_,0x1c);
      local_190 = (uint64_t *)0x22;
      local_1a0 = (uint64_t *)0x0;
      sub_0x0cfd8(&local_1e0,&local_1a0);
      local_1a0 = *(uint64_t **)*plocal_uvar_19;
      local_188 = local_1a0[3];
      local_190 = (uint64_t *)local_1a0[2];
      local_198 = (char *)local_1a0[1];
      local_1a0 = (uint64_t *)*local_1a0;
      plocal_uvar_19 = *(uint64_t **)*plocal_var_23;
      local_168 = plocal_uvar_19[3];
      local_170 = plocal_uvar_19[2];
      local_178 = (int64_t *)plocal_uvar_19[1];
      local_180 = (int64_t *)*plocal_uvar_19;
      sub_0x0d138(&local_1f0,local_1e0,local_1d8,&local_1a0);
      input[2] = local_1e8;
      input[1] = local_1f0;
      *input = 1;
      return;
    }
  }
  pplocal_uvar_11 = &local_1a0;
  plocal_var_7 = (int64_t *)0x1a273;
  local_var_8 = 0x37;
  sub_0x13830("a Display implementation returned an error unexpectedlysrc/lib.rs",0x37,pplocal_uvar_11
                   ,&DAT_ram_0001d670,&DAT_ram_0001d690);
  sub_0x00598(&local_10,*(uint64_t *)(local_var_8 + 8),*(uint64_t *)(local_var_8 + 0x10),
                   &DAT_ram_0001a560,pplocal_uvar_11);
  plocal_var_23 = local_8;
  local_var_8 = local_10;
  if (local_10 == 2) goto LAB_ram_000061c8;
  sub_0x07428();
  plocal_uvar_9 = (uint32_t *)((int64_t)_DAT_ram_300000000 + -7);
  if (_DAT_ram_300000000 < plocal_uvar_9) {
    plocal_uvar_9 = (uint32_t *)0x0;
    if (_DAT_ram_300000000 != (uint32_t *)0x0) goto LAB_ram_00006210;
LAB_ram_00006150:
    plocal_uvar_9 = (uint32_t *)&DAT_ram_300007ff9;
  }
  else {
    if (_DAT_ram_300000000 == (uint32_t *)0x0) goto LAB_ram_00006150;
LAB_ram_00006210:
    if (plocal_uvar_9 < (uint32_t *)0x300000008) {
                    /* WARNING: Subroutine does not return */
      sub_0x12600(1,7,&DAT_ram_0001d6e0);
    }
  }
  _DAT_ram_300000000 = plocal_uvar_9;
  *(uint32_t *)((int64_t)plocal_uvar_9 + 3) = 0x7265746e;
  *plocal_uvar_9 = 0x6e756f63;
  plocal_var_23[2] = (int64_t)plocal_uvar_9;
  plocal_var_23[3] = 7;
  plocal_var_23[1] = 7;
  *plocal_var_23 = 1;
  plocal_var_6 = plocal_var_23;
LAB_ram_000061c8:
  plocal_var_7[1] = (int64_t)plocal_var_6;
  *plocal_var_7 = local_var_8;
  return;
}



/* Function: sub_0x06030 @ 0x6030 */

/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void sub_0x06030(void)

{
  int64_t *plocal_var_1;
  uint32_t *plocal_uvar_2;
  int64_t local_var_3;
  uint8_t *plocal_uvar_4;
  uint64_t *unaff_R8;
  uint8_t auStack_1a0 [400];
  int64_t lStack_10;
  uint64_t *puStack_8;
  
  sub_0x06030();
  plocal_uvar_4 = auStack_1a0;
  plocal_var_1 = (int64_t *)0x1a273;
  local_var_3 = 0x37;
  sub_0x13830("a Display implementation returned an error unexpectedlysrc/lib.rs",0x37,plocal_uvar_4,
                   &DAT_ram_0001d670,&DAT_ram_0001d690);
  sub_0x00598(&lStack_10,*(uint64_t *)(local_var_3 + 8),*(uint64_t *)(local_var_3 + 0x10),
                   &DAT_ram_0001a560,plocal_uvar_4);
  if (lStack_10 == 2) goto LAB_ram_000061c8;
  sub_0x07428();
  plocal_uvar_2 = (uint32_t *)((int64_t)_DAT_ram_300000000 + -7);
  if (_DAT_ram_300000000 < plocal_uvar_2) {
    plocal_uvar_2 = (uint32_t *)0x0;
    if (_DAT_ram_300000000 != (uint32_t *)0x0) goto LAB_ram_00006210;
LAB_ram_00006150:
    plocal_uvar_2 = (uint32_t *)&DAT_ram_300007ff9;
  }
  else {
    if (_DAT_ram_300000000 == (uint32_t *)0x0) goto LAB_ram_00006150;
LAB_ram_00006210:
    if (plocal_uvar_2 < (uint32_t *)0x300000008) {
                    /* WARNING: Subroutine does not return */
      sub_0x12600(1,7,&DAT_ram_0001d6e0);
    }
  }
  _DAT_ram_300000000 = plocal_uvar_2;
  *(uint32_t *)((int64_t)plocal_uvar_2 + 3) = 0x7265746e;
  *plocal_uvar_2 = 0x6e756f63;
  puStack_8[2] = plocal_uvar_2;
  puStack_8[3] = 7;
  puStack_8[1] = 7;
  *puStack_8 = 1;
  unaff_R8 = puStack_8;
LAB_ram_000061c8:
  plocal_var_1[1] = (int64_t)unaff_R8;
  *plocal_var_1 = lStack_10;
  return;
}



/* Function: sub_0x06088 @ 0x6088 */

/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void sub_0x06088(int64_t *input,int64_t param_2,uint64_t param_3)

{
  uint32_t *plocal_uvar_1;
  uint64_t *unaff_R8;
  int64_t local_10;
  uint64_t *local_8;
  
  sub_0x00598(&local_10,*(uint64_t *)(param_2 + 8),*(uint64_t *)(param_2 + 0x10),
                   &DAT_ram_0001a560,param_3);
  if (local_10 == 2) goto LAB_ram_000061c8;
  sub_0x07428();
  plocal_uvar_1 = (uint32_t *)((int64_t)_DAT_ram_300000000 + -7);
  if (_DAT_ram_300000000 < plocal_uvar_1) {
    plocal_uvar_1 = (uint32_t *)0x0;
    if (_DAT_ram_300000000 != (uint32_t *)0x0) goto LAB_ram_00006210;
LAB_ram_00006150:
    plocal_uvar_1 = (uint32_t *)&DAT_ram_300007ff9;
  }
  else {
    if (_DAT_ram_300000000 == (uint32_t *)0x0) goto LAB_ram_00006150;
LAB_ram_00006210:
    if (plocal_uvar_1 < (uint32_t *)0x300000008) {
                    /* WARNING: Subroutine does not return */
      sub_0x12600(1,7,&DAT_ram_0001d6e0);
    }
  }
  _DAT_ram_300000000 = plocal_uvar_1;
  *(uint32_t *)((int64_t)plocal_uvar_1 + 3) = 0x7265746e;
  *plocal_uvar_1 = 0x6e756f63;
  local_8[2] = plocal_uvar_1;
  local_8[3] = 7;
  local_8[1] = 7;
  *local_8 = 1;
  unaff_R8 = local_8;
LAB_ram_000061c8:
  input[1] = (int64_t)unaff_R8;
  *input = local_10;
  return;
}



/* Function: sub_0x06268 @ 0x6268 */

/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void sub_0x06268(uint64_t *input)

{
  bool is_valid_1;
  bool is_valid_2;
  byte is_valid_3;
  uint64_t local_uvar_4;
  uint64_t local_uvar_5;
  uint32_t *plocal_uvar_6;
  uint64_t *plocal_uvar_7;
  uint32_t *plocal_uvar_8;
  int64_t local_var_9;
  uint64_t local_uvar_10;
  uint64_t local_uvar_11;
  uint64_t local_108;
  uint64_t *local_c8;
  uint64_t *local_c0;
  uint64_t local_b8;
  uint64_t *local_b0;
  uint8_t auStack_a8 [16];
  int64_t local_98;
  uint64_t *local_90;
  uint64_t *local_88;
  uint64_t *local_80;
  uint64_t local_78;
  int64_t local_70;
  uint64_t local_60;
  uint64_t local_58;
  uint64_t local_50;
  uint64_t local_48;
  uint64_t local_40;
  uint64_t local_38;
  uint64_t local_30;
  uint64_t local_28;
  uint64_t local_20;
  uint64_t local_18;
  uint64_t local_10;
  uint64_t local_8;
  
  sub_0x02370(&local_98);
  if (local_98 != 1) {
    local_18 = DAT_ram_0001d6d8;
    local_20 = DAT_ram_0001d6d0;
    local_28 = DAT_ram_0001d6c8;
    local_30 = DAT_ram_0001d6c0;
    local_10 = 0;
    local_8 = 0;
    sub_0x193a8(&local_80,&local_30,0x30);
    plocal_uvar_7 = (uint64_t *)*local_90;
    local_38 = plocal_uvar_7[3];
    local_40 = plocal_uvar_7[2];
    local_48 = plocal_uvar_7[1];
    local_50 = *plocal_uvar_7;
    local_uvar_4 = sub_0x00e70(local_60,local_58);
    if (local_70 == 0) {
      sub_0x02678(auStack_a8,&local_80,1,&local_60,1);
    }
    local_var_9 = 0;
    is_valid_2 = false;
    local_uvar_5 = local_uvar_4;
    do {
      local_uvar_5 = local_uvar_5 & local_78;
      local_uvar_11 = *(uint64_t *)((int64_t)local_80 + local_uvar_5);
      local_uvar_10 = local_uvar_11 ^ (local_uvar_4 >> 0x39) * 0x101010101010101;
      for (local_uvar_10 = (local_uvar_10 ^ 0xffffffffffffffff) & local_uvar_10 + 0xfefefefefefefeff & 0x8080808080808080
          ; local_uvar_10 != 0; local_uvar_10 = local_uvar_10 - 1 & local_uvar_10) {
        plocal_uvar_7 = local_80 +
                 (((byte)(&DAT_ram_0001a218)[(local_uvar_10 & -local_uvar_10) * 0x218a392cd3d5dbf >> 0x3a] >> 3) +
                  local_uvar_5 & local_78) * -4 + -4;
        if ((((local_50 != *plocal_uvar_7) || (local_48 != plocal_uvar_7[1])) || (local_40 != plocal_uvar_7[2])) ||
           (is_valid_1 = false, local_38 != plocal_uvar_7[3])) {
          is_valid_1 = true;
        }
        if (!is_valid_1) {
          sub_0x0eee8(&local_b8,0x7f8);
          sub_0x07428();
          plocal_uvar_8 = (uint32_t *)0x0;
          if ((uint32_t *)((int64_t)_DAT_ram_300000000 + -7) <= _DAT_ram_300000000) {
            plocal_uvar_8 = (uint32_t *)((int64_t)_DAT_ram_300000000 + -7);
          }
          if (_DAT_ram_300000000 == (uint32_t *)0x0) {
            plocal_uvar_8 = (uint32_t *)&DAT_ram_300007ff9;
          }
          else if (plocal_uvar_8 < (uint32_t *)0x300000008) goto LAB_ram_00006c20;
          _DAT_ram_300000000 = plocal_uvar_8;
          *(uint32_t *)((int64_t)plocal_uvar_8 + 3) = 0x7265746e;
          *plocal_uvar_8 = 0x6e756f63;
          local_b0[2] = plocal_uvar_8;
          local_b0[3] = 7;
          local_b0[1] = 7;
          *local_b0 = 1;
          input[2] = local_b0;
          input[1] = local_b8;
          *input = 1;
          return;
        }
      }
      local_uvar_10 = local_uvar_11 & 0x8080808080808080;
      if (is_valid_2) {
LAB_ram_00006768:
        if ((local_uvar_10 & local_uvar_11 << 1) != 0) goto LAB_ram_00006a30;
        is_valid_2 = true;
      }
      else {
        if (local_uvar_10 != 0) {
          local_108 = ((byte)(&DAT_ram_0001a218)[(local_uvar_10 & -local_uvar_10) * 0x218a392cd3d5dbf >> 0x3a] >>
                      3) + local_uvar_5 & local_78;
          goto LAB_ram_00006768;
        }
        is_valid_2 = false;
      }
      local_var_9 = local_var_9 + 8;
      local_uvar_5 = local_uvar_5 + local_var_9;
    } while( true );
  }
  sub_0x07428();
  plocal_uvar_6 = (uint32_t *)0x0;
  if ((uint32_t *)((int64_t)_DAT_ram_300000000 + -7) <= _DAT_ram_300000000) {
    plocal_uvar_6 = (uint32_t *)((int64_t)_DAT_ram_300000000 + -7);
  }
  local_c8 = local_90;
  local_c0 = local_88;
  if (_DAT_ram_300000000 == (uint32_t *)0x0) {
    plocal_uvar_6 = (uint32_t *)&DAT_ram_300007ff9;
  }
joined_r0x00006c18:
  if ((uint32_t *)0x300000007 < plocal_uvar_6) {
    _DAT_ram_300000000 = plocal_uvar_6;
    *(uint32_t *)((int64_t)plocal_uvar_6 + 3) = 0x7265746e;
    *plocal_uvar_6 = 0x6e756f63;
    local_c0[2] = plocal_uvar_6;
    local_c0[3] = 7;
    local_c0[1] = 7;
    *local_c0 = 1;
    input[2] = local_c0;
    input[1] = local_c8;
    *input = 1;
    return;
  }
LAB_ram_00006c20:
                    /* WARNING: Subroutine does not return */
  sub_0x12600(1,7,&DAT_ram_0001d6e0);
LAB_ram_00006a30:
  if (-1 < *(char *)((int64_t)local_80 + local_108)) {
    local_108 = (uint64_t)
                ((byte)(&DAT_ram_0001a218)
                       [(*local_80 & 0x8080808080808080 & -(*local_80 & 0x8080808080808080)) *
                        0x218a392cd3d5dbf >> 0x3a] >> 3);
  }
  is_valid_3 = (byte)(local_uvar_4 >> 0x39);
  *(byte *)((int64_t)local_80 + local_108) = is_valid_3;
  *(byte *)((int64_t)local_80 + (local_108 - 8 & local_78) + 8) = is_valid_3;
  local_80[local_108 * -4 + -1] = local_38;
  local_80[local_108 * -4 + -2] = local_40;
  local_80[local_108 * -4 + -3] = local_48;
  local_80[local_108 * -4 + -4] = local_50;
  if (*(char *)((int64_t)local_90 + 0x29) != '\0') {
    input[2] = local_88;
    input[1] = local_90;
    *input = 0;
    return;
  }
  sub_0x0eee8(&local_c8,2000);
  sub_0x07428();
  plocal_uvar_8 = (uint32_t *)0x0;
  if ((uint32_t *)((int64_t)_DAT_ram_300000000 + -7) <= _DAT_ram_300000000) {
    plocal_uvar_8 = (uint32_t *)((int64_t)_DAT_ram_300000000 + -7);
  }
  plocal_uvar_6 = (uint32_t *)&DAT_ram_300007ff9;
  if (_DAT_ram_300000000 != (uint32_t *)0x0) {
    plocal_uvar_6 = plocal_uvar_8;
  }
  goto joined_r0x00006c18;
}



/* Function: sub_0x06d60 @ 0x6d60 */

/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void sub_0x06d60(int64_t *input,uint64_t *param_2,uint64_t param_3)

{
  uint32_t *plocal_uvar_1;
  uint64_t *unaff_R8;
  int64_t local_10;
  uint64_t *local_8;
  
  sub_0x00598(&local_10,*param_2,param_2[1],&DAT_ram_0001a560,param_3);
  if (local_10 == 2) goto LAB_ram_00006ea0;
  sub_0x07428();
  plocal_uvar_1 = (uint32_t *)((int64_t)_DAT_ram_300000000 + -7);
  if (_DAT_ram_300000000 < plocal_uvar_1) {
    plocal_uvar_1 = (uint32_t *)0x0;
    if (_DAT_ram_300000000 != (uint32_t *)0x0) goto LAB_ram_00006ee8;
LAB_ram_00006e28:
    plocal_uvar_1 = (uint32_t *)&DAT_ram_300007ff9;
  }
  else {
    if (_DAT_ram_300000000 == (uint32_t *)0x0) goto LAB_ram_00006e28;
LAB_ram_00006ee8:
    if (plocal_uvar_1 < (uint32_t *)0x300000008) {
                    /* WARNING: Subroutine does not return */
      sub_0x12600(1,7,&DAT_ram_0001d6e0);
    }
  }
  _DAT_ram_300000000 = plocal_uvar_1;
  *(uint32_t *)((int64_t)plocal_uvar_1 + 3) = 0x7265746e;
  *plocal_uvar_1 = 0x6e756f63;
  local_8[2] = plocal_uvar_1;
  local_8[3] = 7;
  local_8[1] = 7;
  *local_8 = 1;
  unaff_R8 = local_8;
LAB_ram_00006ea0:
  input[1] = (int64_t)unaff_R8;
  *input = local_10;
  return;
}



/* Function: sub_0x06f40 @ 0x6f40 */

/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void sub_0x06f40(uint64_t *input,int64_t *param_2)

{
  int64_t local_var_1;
  uint64_t local_uvar_2;
  uint32_t *plocal_uvar_3;
  uint64_t local_118;
  uint64_t local_110;
  uint64_t local_108;
  uint64_t local_100;
  uint64_t local_f8;
  uint64_t *local_f0;
  uint64_t local_e8;
  char *local_e0;
  uint64_t local_d8;
  uint32_t local_d0;
  uint64_t local_c8;
  uint64_t local_c0;
  uint64_t local_b8;
  uint64_t local_b0;
  uint64_t local_a8;
  uint64_t local_a0;
  uint8_t local_98;
  uint32_t local_50;
  uint64_t local_48;
  uint64_t local_40;
  uint64_t local_38;
  uint64_t local_30;
  uint64_t local_28;
  uint64_t local_20;
  uint64_t *local_18;
  uint8_t *local_10;
  uint64_t local_8;
  
  if ((uint64_t)param_2[1] < 8) {
    sub_0x0eee8(&local_118,0xbb9);
    input[1] = local_110;
    *input = local_118;
    return;
  }
  if (*(int64_t *)*param_2 == 0x197cfdbcf504b0ff) {
    if ((param_2[1] & 0xfffffffffffffff8U) == 8) {
      local_uvar_2 = sub_0x11758(&DAT_ram_0001d628);
      sub_0x0eee8(&local_108,0xbbb);
      if (((1 < (local_uvar_2 & 3) - 2) && ((local_uvar_2 & 3) != 0)) &&
         ((code *)**(uint64_t **)(local_uvar_2 + 7) != (code *)0x0)) {
        (*(code *)**(uint64_t **)(local_uvar_2 + 7))(*(uint64_t *)(local_uvar_2 - 1));
      }
      input[1] = local_100;
      *input = local_108;
      return;
    }
    input[1] = ((int64_t *)*param_2)[1];
    *input = 2;
    return;
  }
  sub_0x0e260(&local_48,&DAT_ram_0001a60c);
  local_20 = 0;
  local_28 = 1;
  local_30 = 0;
  local_10 = &DAT_ram_0001d640;
  local_18 = &local_30;
  local_8 = 0xe0000020;
  local_var_1 = sub_0x0f138(&DAT_ram_0001a60c,&local_18);
  if (local_var_1 != 0) {
    sub_0x13830("a Display implementation returned an error unexpectedlysrc/lib.rs",0x37,
                     &local_e8,&DAT_ram_0001d670,&DAT_ram_0001d690);
    sub_0x12180();
    return;
  }
  local_a0 = local_20;
  local_a8 = local_28;
  local_b0 = local_30;
  local_c8 = local_48;
  local_c0 = local_40;
  local_b8 = local_38;
  local_e0 = "programs/counter_anchor/src/lib.rsfailed to write whole buffer";
  local_50 = 0xbba;
  local_98 = 2;
  local_d0 = 0x30;
  local_d8 = 0x22;
  local_e8 = 0;
  sub_0x0cfd8(&local_f8,&local_e8);
  sub_0x07428();
  plocal_uvar_3 = (uint32_t *)((int64_t)_DAT_ram_300000000 + -7);
  if (_DAT_ram_300000000 < plocal_uvar_3) {
    plocal_uvar_3 = (uint32_t *)0x0;
  }
  if (_DAT_ram_300000000 == (uint32_t *)0x0) {
    plocal_uvar_3 = (uint32_t *)&DAT_ram_300007ff9;
  }
  else if (plocal_uvar_3 < (uint32_t *)0x300000008) {
                    /* WARNING: Subroutine does not return */
    sub_0x12600(1,7,&DAT_ram_0001d6e0);
  }
  _DAT_ram_300000000 = plocal_uvar_3;
  *(uint32_t *)((int64_t)plocal_uvar_3 + 3) = 0x7265746e;
  *plocal_uvar_3 = 0x6e756f43;
  local_f0[2] = plocal_uvar_3;
  local_f0[3] = 7;
  local_f0[1] = 7;
  *local_f0 = 1;
  input[1] = local_f0;
  *input = local_f8;
  return;
}



/* Function: sub_0x07418 @ 0x7418 */

void sub_0x07418(void)

{
  sub_0x12180();
  return;
}



/* Function: sub_0x07428 @ 0x7428 */

void sub_0x07428(void)

{
  return;
}



/* Function: sub_0x07430 @ 0x7430 */

void sub_0x07430(uint64_t *input,int64_t param_2)

{
  uint64_t local_uvar_1;
  uint64_t local_10;
  int64_t local_8;
  
  local_uvar_1 = 2;
  if (*(char *)(param_2 + 0x28) == '\0') {
    sub_0x0eee8(&local_10,0xbc2);
    local_uvar_1 = local_10;
    param_2 = local_8;
  }
  *input = local_uvar_1;
  input[1] = param_2;
  return;
}



/* Function: sub_0x07498 @ 0x7498 */

uint64_t sub_0x07498(int64_t *input,uint64_t param_2,uint64_t param_3)

{
  uint64_t local_uvar_1;
  uint64_t local_uvar_2;
  uint64_t local_uvar_3;
  uint64_t local_uvar_4;
  
  local_uvar_4 = input[2];
  local_uvar_3 = 0;
  if ((local_uvar_4 <= (uint64_t)input[1]) && (local_uvar_2 = input[1] - local_uvar_4, local_uvar_2 != 0)) {
    local_uvar_3 = param_3;
    if (local_uvar_2 <= param_3) {
      local_uvar_3 = local_uvar_2;
    }
    sub_0x07510(*input + local_uvar_4,param_2,local_uvar_3);
    if (local_uvar_4 + local_uvar_3 < local_uvar_4) {
                    /* WARNING: Subroutine does not return */
      sub_0x178f0(&DAT_ram_0001d738);
    }
    input[2] = local_uvar_4 + local_uvar_3;
  }
  local_uvar_1 = 0;
  if (param_3 != local_uvar_3) {
    local_uvar_1 = sub_0x11a98(0x17,"failed to write whole buffer",0x1c);
  }
  return local_uvar_1;
}



/* Function: sub_0x07510 @ 0x7510 */

uint64_t sub_0x07510(void)

{
  uint64_t local_uvar_1;
  int64_t unaff_R6;
  int64_t unaff_R7;
  int64_t unaff_R8;
  uint64_t unaff_R9;
  
  sub_0x07510();
  local_uvar_1 = 0;
  if (unaff_R9 <= unaff_R9 + unaff_R8) {
    *(uint64_t *)(unaff_R7 + 0x10) = unaff_R9 + unaff_R8;
    if (unaff_R6 != unaff_R8) {
      local_uvar_1 = sub_0x11a98(0x17,"failed to write whole buffer",0x1c);
    }
    return local_uvar_1;
  }
                    /* WARNING: Subroutine does not return */
  sub_0x178f0(&DAT_ram_0001d738);
}



/* Function: sub_0x075b0 @ 0x75b0 */

uint64_t sub_0x075b0(int64_t input)

{
  uint64_t local_uvar_1;
  int64_t *plocal_var_2;
  
  plocal_var_2 = *(int64_t **)(input + 0x18);
  if ((((*plocal_var_2 == 0) && (plocal_var_2[1] == 0)) && (plocal_var_2[2] == 0)) && (plocal_var_2[3] == 0)) {
    local_uvar_1 = sub_0x11020();
  }
  else {
    local_uvar_1 = 0;
  }
  return local_uvar_1;
}



/* Function: sub_0x07640 @ 0x7640 */

void sub_0x07640(uint64_t *input,int64_t *param_2)

{
  int64_t local_var_1;
  int64_t local_var_2;
  int64_t local_var_3;
  uint64_t *plocal_uvar_4;
  uint64_t local_b0;
  uint64_t local_a8;
  uint64_t local_98;
  uint64_t local_90;
  int local_88;
  uint32_t local_84;
  int64_t local_80;
  uint64_t local_78;
  int64_t local_68;
  uint64_t local_60;
  uint8_t auStack_30 [8];
  int64_t *local_28;
  int64_t *local_20 [4];
  
  sub_0x0be90(&local_80,param_2[3]);
  sub_0x193a8(auStack_30,param_2 + 3,0x30);
  sub_0x084a0(&local_88,&local_80,auStack_30,1);
  if (local_88 == 0x1a) {
    local_a8 = 2;
  }
  else {
    sub_0x0d068(&local_98,local_88,local_84);
    local_b0 = local_90;
    local_a8 = local_98;
  }
  if (local_80 != 0) {
    sub_0x042f8(local_78,local_80 * 0x22,1);
  }
  if (local_68 != 0) {
    sub_0x042f8(local_60,local_68,1);
  }
  local_var_1 = *local_28;
  *local_28 = local_var_1 + -1;
  if (local_var_1 + -1 == 0) {
    sub_0x10ea0(&local_28);
  }
  local_var_1 = *local_20[0];
  *local_20[0] = local_var_1 + -1;
  if (local_var_1 + -1 == 0) {
    sub_0x10ef0(local_20);
  }
  local_var_3 = param_2[1];
  local_var_1 = param_2[2];
  if (local_var_1 != 0) {
    plocal_uvar_4 = (uint64_t *)(local_var_3 + 0x10);
    do {
      local_var_2 = *(int64_t *)plocal_uvar_4[-1] + -1;
      *(int64_t *)plocal_uvar_4[-1] = local_var_2;
      if (local_var_2 == 0) {
        sub_0x10ea0(plocal_uvar_4 + -1);
      }
      local_var_2 = *(int64_t *)*plocal_uvar_4 + -1;
      *(int64_t *)*plocal_uvar_4 = local_var_2;
      if (local_var_2 == 0) {
        sub_0x10ef0(plocal_uvar_4);
      }
      plocal_uvar_4 = plocal_uvar_4 + 6;
      local_var_1 = local_var_1 + -1;
    } while (local_var_1 != 0);
  }
  if (*param_2 != 0) {
    sub_0x042f8(local_var_3,*param_2 * 0x30,8);
  }
  input[1] = local_b0;
  *input = local_a8;
  return;
}



/* Function: sub_0x07980 @ 0x7980 */

void sub_0x07980(uint64_t *input,int64_t *param_2)

{
  int64_t local_var_1;
  int64_t local_var_2;
  int64_t local_var_3;
  uint64_t *plocal_uvar_4;
  uint64_t local_b0;
  uint64_t local_a8;
  uint64_t local_98;
  uint64_t local_90;
  int local_88;
  uint32_t local_84;
  int64_t local_80;
  uint64_t local_78;
  int64_t local_68;
  uint64_t local_60;
  uint8_t auStack_30 [8];
  int64_t *local_28;
  int64_t *local_20 [4];
  
  sub_0x0bbc8(&local_80,param_2[3]);
  sub_0x193a8(auStack_30,param_2 + 3,0x30);
  sub_0x084a0(&local_88,&local_80,auStack_30,1);
  if (local_88 == 0x1a) {
    local_a8 = 2;
  }
  else {
    sub_0x0d068(&local_98,local_88,local_84);
    local_b0 = local_90;
    local_a8 = local_98;
  }
  if (local_80 != 0) {
    sub_0x042f8(local_78,local_80 * 0x22,1);
  }
  if (local_68 != 0) {
    sub_0x042f8(local_60,local_68,1);
  }
  local_var_1 = *local_28;
  *local_28 = local_var_1 + -1;
  if (local_var_1 + -1 == 0) {
    sub_0x10ea0(&local_28);
  }
  local_var_1 = *local_20[0];
  *local_20[0] = local_var_1 + -1;
  if (local_var_1 + -1 == 0) {
    sub_0x10ef0(local_20);
  }
  local_var_3 = param_2[1];
  local_var_1 = param_2[2];
  if (local_var_1 != 0) {
    plocal_uvar_4 = (uint64_t *)(local_var_3 + 0x10);
    do {
      local_var_2 = *(int64_t *)plocal_uvar_4[-1] + -1;
      *(int64_t *)plocal_uvar_4[-1] = local_var_2;
      if (local_var_2 == 0) {
        sub_0x10ea0(plocal_uvar_4 + -1);
      }
      local_var_2 = *(int64_t *)*plocal_uvar_4 + -1;
      *(int64_t *)*plocal_uvar_4 = local_var_2;
      if (local_var_2 == 0) {
        sub_0x10ef0(plocal_uvar_4);
      }
      plocal_uvar_4 = plocal_uvar_4 + 6;
      local_var_1 = local_var_1 + -1;
    } while (local_var_1 != 0);
  }
  if (*param_2 != 0) {
    sub_0x042f8(local_var_3,*param_2 * 0x30,8);
  }
  input[1] = local_b0;
  *input = local_a8;
  return;
}



/* Function: sub_0x07cc0 @ 0x7cc0 */

void sub_0x07cc0(uint64_t *input,int64_t *param_2,uint64_t param_3)

{
  int64_t local_var_1;
  int64_t local_var_2;
  uint64_t local_uvar_3;
  int64_t local_var_4;
  uint64_t *plocal_uvar_5;
  uint64_t local_e0;
  uint64_t local_c8;
  uint64_t local_c0;
  int local_b8;
  uint32_t local_b4;
  int64_t local_b0;
  uint64_t local_a8;
  int64_t local_98;
  uint64_t local_90;
  uint8_t auStack_60 [8];
  int64_t *local_58;
  int64_t *local_50 [4];
  uint8_t auStack_30 [8];
  int64_t *local_28;
  int64_t *local_20 [4];
  
  sub_0x0b9f8(&local_b0,param_2[3],param_2[9],param_3);
  sub_0x193a8(auStack_60,param_2 + 3,0x30);
  sub_0x193a8(auStack_30,param_2 + 9,0x30);
  sub_0x084a0(&local_b8,&local_b0,auStack_60,2);
  local_uvar_3 = 2;
  if (local_b8 != 0x1a) {
    sub_0x0d068(&local_c8,local_b8,local_b4);
    local_e0 = local_c0;
    local_uvar_3 = local_c8;
  }
  if (local_b0 != 0) {
    sub_0x042f8(local_a8,local_b0 * 0x22,1);
  }
  if (local_98 != 0) {
    sub_0x042f8(local_90,local_98,1);
  }
  local_var_1 = *local_58;
  *local_58 = local_var_1 + -1;
  if (local_var_1 + -1 == 0) {
    sub_0x10ea0(&local_58);
  }
  local_var_1 = *local_50[0];
  *local_50[0] = local_var_1 + -1;
  if (local_var_1 + -1 == 0) {
    sub_0x10ef0(local_50);
  }
  local_var_1 = *local_28;
  *local_28 = local_var_1 + -1;
  if (local_var_1 + -1 == 0) {
    sub_0x10ea0(&local_28);
  }
  local_var_1 = *local_20[0];
  *local_20[0] = local_var_1 + -1;
  if (local_var_1 + -1 == 0) {
    sub_0x10ef0(local_20);
  }
  local_var_4 = param_2[1];
  local_var_1 = param_2[2];
  if (local_var_1 != 0) {
    plocal_uvar_5 = (uint64_t *)(local_var_4 + 0x10);
    do {
      local_var_2 = *(int64_t *)plocal_uvar_5[-1] + -1;
      *(int64_t *)plocal_uvar_5[-1] = local_var_2;
      if (local_var_2 == 0) {
        sub_0x10ea0(plocal_uvar_5 + -1);
      }
      local_var_2 = *(int64_t *)*plocal_uvar_5 + -1;
      *(int64_t *)*plocal_uvar_5 = local_var_2;
      if (local_var_2 == 0) {
        sub_0x10ef0(plocal_uvar_5);
      }
      plocal_uvar_5 = plocal_uvar_5 + 6;
      local_var_1 = local_var_1 + -1;
    } while (local_var_1 != 0);
  }
  if (*param_2 != 0) {
    sub_0x042f8(local_var_4,*param_2 * 0x30,8);
  }
  input[1] = local_e0;
  *input = local_uvar_3;
  return;
}



/* Function: sub_0x080c0 @ 0x80c0 */

void sub_0x080c0(uint64_t *input,int64_t *param_2,uint64_t param_3)

{
  int64_t local_var_1;
  int64_t local_var_2;
  uint64_t local_uvar_3;
  int64_t local_var_4;
  uint64_t *plocal_uvar_5;
  uint64_t local_e0;
  uint64_t local_c8;
  uint64_t local_c0;
  int local_b8;
  uint32_t local_b4;
  int64_t local_b0;
  uint64_t local_a8;
  int64_t local_98;
  uint64_t local_90;
  uint8_t auStack_60 [8];
  int64_t *local_58;
  int64_t *local_50 [4];
  uint8_t auStack_30 [8];
  int64_t *local_28;
  int64_t *local_20 [4];
  
  sub_0x0bd20(&local_b0,param_2[3],param_2[9],param_3);
  sub_0x193a8(auStack_60,param_2 + 3,0x30);
  sub_0x193a8(auStack_30,param_2 + 9,0x30);
  sub_0x084a0(&local_b8,&local_b0,auStack_60,2);
  local_uvar_3 = 2;
  if (local_b8 != 0x1a) {
    sub_0x0d068(&local_c8,local_b8,local_b4);
    local_e0 = local_c0;
    local_uvar_3 = local_c8;
  }
  if (local_b0 != 0) {
    sub_0x042f8(local_a8,local_b0 * 0x22,1);
  }
  if (local_98 != 0) {
    sub_0x042f8(local_90,local_98,1);
  }
  local_var_1 = *local_58;
  *local_58 = local_var_1 + -1;
  if (local_var_1 + -1 == 0) {
    sub_0x10ea0(&local_58);
  }
  local_var_1 = *local_50[0];
  *local_50[0] = local_var_1 + -1;
  if (local_var_1 + -1 == 0) {
    sub_0x10ef0(local_50);
  }
  local_var_1 = *local_28;
  *local_28 = local_var_1 + -1;
  if (local_var_1 + -1 == 0) {
    sub_0x10ea0(&local_28);
  }
  local_var_1 = *local_20[0];
  *local_20[0] = local_var_1 + -1;
  if (local_var_1 + -1 == 0) {
    sub_0x10ef0(local_20);
  }
  local_var_4 = param_2[1];
  local_var_1 = param_2[2];
  if (local_var_1 != 0) {
    plocal_uvar_5 = (uint64_t *)(local_var_4 + 0x10);
    do {
      local_var_2 = *(int64_t *)plocal_uvar_5[-1] + -1;
      *(int64_t *)plocal_uvar_5[-1] = local_var_2;
      if (local_var_2 == 0) {
        sub_0x10ea0(plocal_uvar_5 + -1);
      }
      local_var_2 = *(int64_t *)*plocal_uvar_5 + -1;
      *(int64_t *)*plocal_uvar_5 = local_var_2;
      if (local_var_2 == 0) {
        sub_0x10ef0(plocal_uvar_5);
      }
      plocal_uvar_5 = plocal_uvar_5 + 6;
      local_var_1 = local_var_1 + -1;
    } while (local_var_1 != 0);
  }
  if (*param_2 != 0) {
    sub_0x042f8(local_var_4,*param_2 * 0x30,8);
  }
  input[1] = local_e0;
  *input = local_uvar_3;
  return;
}



/* Function: sub_0x084a0 @ 0x84a0 */

void sub_0x084a0(uint32_t *input,uint64_t *param_2,int64_t param_3,int64_t param_4,
                     int64_t param_5)

{
  bool is_valid_1;
  uint64_t local_uvar_2;
  uint64_t local_uvar_3;
  int64_t *plocal_var_4;
  int64_t *plocal_var_5;
  int64_t *plocal_var_6;
  int64_t *plocal_var_7;
  int64_t local_var_8;
  uint64_t local_a8;
  uint64_t local_a0;
  int64_t *local_50;
  uint64_t local_48;
  int64_t local_40;
  uint64_t local_38;
  uint64_t local_30;
  uint64_t local_28;
  uint64_t local_20;
  uint64_t local_18;
  uint64_t local_10;
  uint64_t local_8;
  
  local_50 = (int64_t *)param_2[1];
  local_40 = param_2[2];
  if ((local_40 != 0) && (param_4 != 0)) {
    plocal_var_6 = local_50;
    do {
      plocal_var_7 = (int64_t *)((int64_t)plocal_var_6 + 0x22);
      plocal_var_5 = (int64_t *)(param_3 + 0x10);
      local_var_8 = param_4 * 0x30;
      do {
        plocal_var_4 = (int64_t *)plocal_var_5[-2];
        if ((((*plocal_var_6 != *plocal_var_4) || (plocal_var_6[1] != plocal_var_4[1])) || (plocal_var_6[2] != plocal_var_4[2])) ||
           (is_valid_1 = false, plocal_var_6[3] != plocal_var_4[3])) {
          is_valid_1 = true;
        }
        if (!is_valid_1) {
          local_uvar_2 = *(uint64_t *)(plocal_var_5[-1] + 0x10);
          if (*(char *)((int64_t)plocal_var_6 + 0x21) == '\0') {
            if ((local_uvar_2 < 0x7fffffffffffffff) &&
               (local_a0 = local_a8, *(uint64_t *)(*plocal_var_5 + 0x10) < 0x7fffffffffffffff)) {
              local_a0 = plocal_var_5[-1] + 0x10;
              local_a8 = *plocal_var_5 + 0x10;
              break;
            }
            local_uvar_3 = local_a0 & 0xffffffff00000000 | 0xb;
          }
          else {
            local_uvar_3 = 0xb;
            if ((local_uvar_2 == 0) && (*(int64_t *)(*plocal_var_5 + 0x10) == 0)) break;
          }
          local_uvar_2 = local_uvar_3 >> 0x20;
          goto LAB_ram_000088d0;
        }
        plocal_var_5 = plocal_var_5 + 6;
        local_var_8 = local_var_8 + -0x30;
      } while (local_var_8 != 0);
      plocal_var_6 = plocal_var_7;
    } while (plocal_var_7 != (int64_t *)((int64_t)local_50 + local_40 * 0x22));
  }
  local_20 = param_2[6];
  local_18 = param_2[7];
  local_10 = param_2[8];
  local_8 = param_2[9];
  local_28 = param_2[5];
  local_30 = param_2[3];
  local_38 = param_2[4];
  local_48 = *param_2;
  local_uvar_2 = sub_0x087c0(&local_50,param_3,param_4,*(uint64_t *)(param_5 + -0x1000),
                           *(uint64_t *)(param_5 + -0xff8));
  if (local_uvar_2 == 0) {
    local_uvar_3 = 0x1a;
  }
  else {
    local_uvar_3 = local_uvar_2 << 0x20 | local_uvar_2 - 0x100000000 >> 0x20;
    if (local_uvar_3 < 0x1a) {
      local_uvar_2 = (uint64_t)*(uint *)(&DAT_ram_0001a654 + local_uvar_3 * 4);
    }
    else {
      local_uvar_3 = 0;
    }
  }
LAB_ram_000088d0:
  input[1] = (int)local_uvar_2;
  *input = (int)local_uvar_3;
  return;
}



/* Function: sub_0x087c0 @ 0x87c0 */

void sub_0x087c0(void)

{
  uint64_t local_uvar_1;
  uint64_t local_uvar_2;
  uint32_t *local_88;
  
  local_uvar_1 = sub_0x087c0();
  if (local_uvar_1 == 0) {
    local_uvar_2 = 0x1a;
  }
  else {
    local_uvar_2 = local_uvar_1 << 0x20 | local_uvar_1 - 0x100000000 >> 0x20;
    if (local_uvar_2 < 0x1a) {
      local_uvar_1 = (uint64_t)*(uint *)(&DAT_ram_0001a654 + local_uvar_2 * 4);
    }
    else {
      local_uvar_2 = 0;
    }
  }
  local_88[1] = (int)local_uvar_1;
  *local_88 = (int)local_uvar_2;
  return;
}



/* Function: sub_0x088f0 @ 0x88f0 */

void sub_0x088f0(int64_t input)

{
  int64_t local_var_1;
  
  local_var_1 = *(int64_t *)(&((AccountContext *)input)->ref_count);
  if ((((((((local_var_1 != -1) && (local_var_1 != -2)) && (local_var_1 != -3)) &&
         (((local_var_1 != -4 && (local_var_1 != -5)) && ((local_var_1 != -6 && ((local_var_1 != -7 && (local_var_1 != -8))))))))
        && (local_var_1 != -9)) &&
       ((((((local_var_1 != -10 && (local_var_1 != -0xb)) && (local_var_1 != -0xc)) &&
          ((local_var_1 != -0xd && (local_var_1 != -0xe)))) && (local_var_1 != -0xf)) &&
        (((local_var_1 != -0x10 && (local_var_1 != -0x11)) &&
         (((local_var_1 != -0x12 && (((local_var_1 != -0x13 && (local_var_1 != -0x14)) && (local_var_1 != -0x15)))) &&
          (((local_var_1 != -0x16 && (local_var_1 != -0x17)) && (local_var_1 != -0x18)))))))))) &&
      (((local_var_1 != -0x19 && (local_var_1 != -0x1a)) &&
       ((local_var_1 != -0x1b && (((local_var_1 != -0x1c && (local_var_1 != -0x1d)) && (local_var_1 != -0x1e)))))))) &&
     ((local_var_1 != -0x1f && (local_var_1 + 0x20 != 0)))) {
    *(int64_t *)(&((AccountContext *)input)->ref_count) = local_var_1 + 0x20;
    return;
  }
                    /* WARNING: Subroutine does not return */
  sub_0x178f0(&DAT_ram_0001d880);
}



/* Function: sub_0x08f18 @ 0x8f18 */

void sub_0x08f18(uint64_t *input,uint64_t *param_2,uint64_t *param_3,uint64_t *param_4
                     )

{
  uint8_t local_uvar_1;
  bool is_valid_2;
  uint64_t local_uvar_3;
  uint8_t *plocal_uvar_4;
  uint64_t local_uvar_5;
  int64_t local_var_6;
  uint64_t local_uvar_7;
  uint8_t *plocal_uvar_8;
  uint64_t *local_28;
  uint8_t *local_20;
  uint8_t *local_18;
  uint8_t *local_10;
  uint8_t uStack_1;
  
  local_20 = &uStack_1;
  local_uvar_5 = *param_3 ^ 0x8000000000000000;
  if (0xc < local_uvar_5) {
    local_uvar_5 = 3;
  }
  plocal_uvar_8 = (uint8_t *)0xc;
  local_28 = param_3;
  if ((int64_t)local_uvar_5 < 6) {
    if (2 < (int64_t)local_uvar_5) {
      if (local_uvar_5 == 3) {
        local_18 = (uint8_t *)0x4;
        sub_0x088f0(&local_20);
        plocal_uvar_8 = local_18 + 8;
        if (((plocal_uvar_8 < local_18) || (plocal_uvar_4 = plocal_uvar_8 + param_3[2], plocal_uvar_4 < plocal_uvar_8)) ||
           (plocal_uvar_4 + 8 < plocal_uvar_4)) goto LAB_ram_0000a228;
        plocal_uvar_8 = plocal_uvar_4 + 0x10;
        is_valid_2 = true;
        if (plocal_uvar_4 + 8 <= plocal_uvar_8) goto LAB_ram_000090d8;
LAB_ram_000090e0:
        if (is_valid_2) goto LAB_ram_0000a228;
        goto LAB_ram_00009450;
      }
      if (local_uvar_5 == 4) goto LAB_ram_00009100;
      goto LAB_ram_00009108;
    }
    if (local_uvar_5 != 0) {
      if (local_uvar_5 == 1) goto LAB_ram_00009090;
      goto LAB_ram_00009108;
    }
    plocal_uvar_8 = (uint8_t *)0x14;
LAB_ram_00009450:
    local_18 = plocal_uvar_8;
    sub_0x088f0(&local_20);
    local_uvar_7 = 0;
    plocal_uvar_8 = local_18;
    if ((int64_t)local_18 < 0) goto LAB_ram_00009488;
    if (local_18 != (uint8_t *)0x0) goto LAB_ram_00009108;
    local_18 = (uint8_t *)0x1;
    local_20 = (uint8_t *)0x0;
    if ((int64_t)local_uvar_5 < 6) goto LAB_ram_0000a278;
LAB_ram_00009158:
    local_10 = (uint8_t *)0x0;
    if (8 < (int64_t)local_uvar_5) {
      if ((int64_t)local_uvar_5 < 0xb) {
        if (local_uvar_5 == 9) {
          local_var_6 = 0;
          plocal_uvar_8 = (uint8_t *)0x0;
          if (local_20 < (uint8_t *)0x4) {
            sub_0x0b478(&local_20,0,4,1,1);
            plocal_uvar_8 = local_10;
          }
          *(uint32_t *)(local_18 + (int64_t)plocal_uvar_8) = 9;
          local_10 = plocal_uvar_8 + 4;
          do {
            local_uvar_1 = *(uint8_t *)((int64_t)param_3 + local_var_6 + 0x20);
            if (local_20 == local_10) {
              sub_0x0b478(&local_20,local_10,1,1,1);
            }
            local_18[(int64_t)local_10] = local_uvar_1;
            local_10 = local_10 + 1;
            local_var_6 = local_var_6 + 1;
          } while (local_var_6 != 0x20);
          local_uvar_3 = param_3[3];
          local_uvar_5 = param_3[2];
          if ((uint64_t)((int64_t)local_20 - (int64_t)local_10) < 8) {
            sub_0x0b478(&local_20,local_10,8,1,1);
          }
          *(uint64_t *)(local_18 + (int64_t)local_10) = local_uvar_3;
          local_10 = local_10 + 8;
          if ((uint64_t)((int64_t)local_20 - (int64_t)local_10) < local_uvar_3) {
            sub_0x0b478(&local_20,local_10,local_uvar_3,1,1);
          }
          plocal_uvar_8 = local_10;
          sub_0x193a8(local_18 + (int64_t)local_10,local_uvar_5,local_uvar_3);
          local_10 = plocal_uvar_8 + local_uvar_3;
          local_uvar_5 = param_3[8];
          if ((uint64_t)((int64_t)local_20 - (int64_t)local_10) < 8) {
            sub_0x0b478(&local_20,local_10,8,1,1);
          }
          *(uint64_t *)(local_18 + (int64_t)local_10) = local_uvar_5;
          local_var_6 = 0;
          local_10 = local_10 + 8;
          do {
            local_uvar_1 = *(uint8_t *)((int64_t)param_3 + local_var_6 + 0x48);
            if (local_20 == local_10) {
              sub_0x0b478(&local_20,local_10,1,1,1);
            }
            local_18[(int64_t)local_10] = local_uvar_1;
            plocal_uvar_8 = local_10 + 1;
            local_var_6 = local_var_6 + 1;
            local_10 = plocal_uvar_8;
          } while (local_var_6 != 0x20);
        }
        else {
          local_var_6 = 0;
          plocal_uvar_8 = (uint8_t *)0x0;
          if (local_20 < (uint8_t *)0x4) {
            sub_0x0b478(&local_20,0,4,1,1);
            plocal_uvar_8 = local_10;
          }
          *(uint32_t *)(local_18 + (int64_t)plocal_uvar_8) = 10;
          local_10 = plocal_uvar_8 + 4;
          do {
            local_uvar_1 = *(uint8_t *)((int64_t)param_3 + local_var_6 + 0x20);
            if (local_20 == local_10) {
              sub_0x0b478(&local_20,local_10,1,1,1);
            }
            local_18[(int64_t)local_10] = local_uvar_1;
            local_10 = local_10 + 1;
            local_var_6 = local_var_6 + 1;
          } while (local_var_6 != 0x20);
          local_uvar_3 = param_3[3];
          local_uvar_5 = param_3[2];
          if ((uint64_t)((int64_t)local_20 - (int64_t)local_10) < 8) {
            sub_0x0b478(&local_20,local_10,8,1,1);
          }
          *(uint64_t *)(local_18 + (int64_t)local_10) = local_uvar_3;
          local_10 = local_10 + 8;
          if ((uint64_t)((int64_t)local_20 - (int64_t)local_10) < local_uvar_3) {
            sub_0x0b478(&local_20,local_10,local_uvar_3,1,1);
          }
          plocal_uvar_8 = local_10;
          sub_0x193a8(local_18 + (int64_t)local_10,local_uvar_5,local_uvar_3);
          local_var_6 = 0;
          local_10 = plocal_uvar_8 + local_uvar_3;
          do {
            local_uvar_1 = *(uint8_t *)((int64_t)param_3 + local_var_6 + 0x40);
            if (local_20 == local_10) {
              sub_0x0b478(&local_20,local_10,1,1,1);
            }
            local_18[(int64_t)local_10] = local_uvar_1;
            plocal_uvar_8 = local_10 + 1;
            local_var_6 = local_var_6 + 1;
            local_10 = plocal_uvar_8;
          } while (local_var_6 != 0x20);
        }
        goto LAB_ram_0000a8f8;
      }
      if (local_uvar_5 == 0xb) {
        plocal_uvar_8 = (uint8_t *)0x0;
        if (local_20 < (uint8_t *)0x4) {
          sub_0x0b478(&local_20,0,4,1,1);
          plocal_uvar_8 = local_10;
        }
        *(uint32_t *)(local_18 + (int64_t)plocal_uvar_8) = 0xb;
        local_10 = plocal_uvar_8 + 4;
        local_uvar_5 = param_3[4];
        if ((uint64_t)((int64_t)local_20 - (int64_t)local_10) < 8) {
          sub_0x0b478(&local_20,local_10,8,1,1);
        }
        *(uint64_t *)(local_18 + (int64_t)local_10) = local_uvar_5;
        local_10 = local_10 + 8;
        local_uvar_3 = param_3[3];
        local_uvar_5 = param_3[2];
        if ((uint64_t)((int64_t)local_20 - (int64_t)local_10) < 8) {
          sub_0x0b478(&local_20,local_10,8,1,1);
        }
        *(uint64_t *)(local_18 + (int64_t)local_10) = local_uvar_3;
        local_10 = local_10 + 8;
        if ((uint64_t)((int64_t)local_20 - (int64_t)local_10) < local_uvar_3) {
          sub_0x0b478(&local_20,local_10,local_uvar_3,1,1);
        }
        plocal_uvar_8 = local_10;
        local_28 = param_3 + 5;
        sub_0x193a8(local_18 + (int64_t)local_10,local_uvar_5,local_uvar_3);
        local_var_6 = 0;
        local_10 = plocal_uvar_8 + local_uvar_3;
        do {
          local_uvar_1 = *(uint8_t *)((int64_t)local_28 + local_var_6);
          if (local_20 == local_10) {
            sub_0x0b478(&local_20,local_10,1,1,1);
          }
          local_18[(int64_t)local_10] = local_uvar_1;
          plocal_uvar_8 = local_10 + 1;
          local_var_6 = local_var_6 + 1;
          local_10 = plocal_uvar_8;
        } while (local_var_6 != 0x20);
        goto LAB_ram_0000a8f8;
      }
      if (local_20 < (uint8_t *)0x4) {
        sub_0x0b478(&local_20,0,4,1,1);
      }
      *(uint32_t *)(local_18 + (int64_t)local_10) = 0xc;
LAB_ram_0000a3c8:
      plocal_uvar_8 = local_10 + 4;
      goto LAB_ram_0000a8f8;
    }
    if (local_uvar_5 == 6) {
      local_var_6 = 0;
      plocal_uvar_8 = (uint8_t *)0x0;
      if (local_20 < (uint8_t *)0x4) {
        sub_0x0b478(&local_20,0,4,1,1);
        plocal_uvar_8 = local_10;
      }
      *(uint32_t *)(local_18 + (int64_t)plocal_uvar_8) = 6;
      local_10 = plocal_uvar_8 + 4;
      do {
        local_uvar_1 = *(uint8_t *)((int64_t)param_3 + local_var_6 + 8);
        if (local_20 == local_10) {
          sub_0x0b478(&local_20,local_10,1,1,1);
        }
        local_18[(int64_t)local_10] = local_uvar_1;
        plocal_uvar_8 = local_10 + 1;
        local_var_6 = local_var_6 + 1;
        local_10 = plocal_uvar_8;
      } while (local_var_6 != 0x20);
      goto LAB_ram_0000a8f8;
    }
    if (local_uvar_5 == 7) {
      local_var_6 = 0;
      plocal_uvar_8 = (uint8_t *)0x0;
      if (local_20 < (uint8_t *)0x4) {
        sub_0x0b478(&local_20,0,4,1,1);
        plocal_uvar_8 = local_10;
      }
      *(uint32_t *)(local_18 + (int64_t)plocal_uvar_8) = 7;
      local_10 = plocal_uvar_8 + 4;
      do {
        local_uvar_1 = *(uint8_t *)((int64_t)param_3 + local_var_6 + 8);
        if (local_20 == local_10) {
          sub_0x0b478(&local_20,local_10,1,1,1);
        }
        local_18[(int64_t)local_10] = local_uvar_1;
        plocal_uvar_8 = local_10 + 1;
        local_var_6 = local_var_6 + 1;
        local_10 = plocal_uvar_8;
      } while (local_var_6 != 0x20);
      goto LAB_ram_0000a8f8;
    }
    plocal_uvar_8 = (uint8_t *)0x0;
    if (local_20 < (uint8_t *)0x4) {
      sub_0x0b478(&local_20,0,4,1,1);
      plocal_uvar_8 = local_10;
    }
    *(uint32_t *)(local_18 + (int64_t)plocal_uvar_8) = 8;
LAB_ram_0000a8a8:
    local_10 = plocal_uvar_8 + 4;
    local_uvar_3 = (int64_t)local_20 - (int64_t)local_10;
    local_uvar_5 = param_3[1];
  }
  else {
    if ((int64_t)local_uvar_5 < 10) {
      if (local_uvar_5 - 6 < 2) {
LAB_ram_00009090:
        plocal_uvar_8 = (uint8_t *)0x4;
        goto LAB_ram_00009450;
      }
      if (local_uvar_5 != 8) {
        local_18 = (uint8_t *)0x4;
        sub_0x088f0(&local_20);
        plocal_uvar_8 = local_18 + 8;
        if ((plocal_uvar_8 < local_18) || (plocal_uvar_4 = plocal_uvar_8 + param_3[3], plocal_uvar_4 < plocal_uvar_8))
        goto LAB_ram_0000a228;
        plocal_uvar_8 = plocal_uvar_4 + 8;
        is_valid_2 = true;
        if (plocal_uvar_4 <= plocal_uvar_8) goto LAB_ram_00009430;
        goto LAB_ram_00009438;
      }
    }
    else {
      if (local_uvar_5 == 10) {
        local_18 = (uint8_t *)0x4;
        sub_0x088f0(&local_20);
        plocal_uvar_4 = local_18 + 8;
        if (plocal_uvar_4 < local_18) goto LAB_ram_0000a228;
        plocal_uvar_8 = plocal_uvar_4 + param_3[3];
        is_valid_2 = true;
        if (plocal_uvar_4 <= plocal_uvar_8) {
LAB_ram_00009430:
          is_valid_2 = false;
        }
LAB_ram_00009438:
        if (is_valid_2) {
LAB_ram_0000a228:
                    /* WARNING: Subroutine does not return */
          sub_0x178f0(&DAT_ram_0001d880);
        }
        goto LAB_ram_00009450;
      }
      if (local_uvar_5 == 0xb) {
        plocal_uvar_8 = (uint8_t *)param_3[3] + 0x14;
        is_valid_2 = true;
        if ((uint8_t *)param_3[3] <= plocal_uvar_8) {
LAB_ram_000090d8:
          is_valid_2 = false;
        }
        goto LAB_ram_000090e0;
      }
LAB_ram_00009100:
      plocal_uvar_8 = (uint8_t *)0x4;
    }
LAB_ram_00009108:
    sub_0x07428();
    local_uvar_7 = 1;
    plocal_uvar_4 = (uint8_t *)sub_0x041e8(plocal_uvar_8,1);
    if (plocal_uvar_4 == (uint8_t *)0x0) {
LAB_ram_00009488:
                    /* WARNING: Subroutine does not return */
      sub_0x12600(local_uvar_7,plocal_uvar_8,&DAT_ram_0001d898);
    }
    local_20 = plocal_uvar_8;
    local_18 = plocal_uvar_4;
    if (5 < (int64_t)local_uvar_5) goto LAB_ram_00009158;
LAB_ram_0000a278:
    local_10 = (uint8_t *)0x0;
    if ((int64_t)local_uvar_5 < 3) {
      if (local_uvar_5 == 0) {
        plocal_uvar_8 = (uint8_t *)0x0;
        if (local_20 < (uint8_t *)0x4) goto LAB_ram_0000aab0;
        goto LAB_ram_0000a3e8;
      }
      if (local_uvar_5 == 1) {
        local_var_6 = 0;
        plocal_uvar_8 = (uint8_t *)0x0;
        if (local_20 < (uint8_t *)0x4) {
          sub_0x0b478(&local_20,0,4,1,1);
          plocal_uvar_8 = local_10;
        }
        *(uint32_t *)(local_18 + (int64_t)plocal_uvar_8) = 1;
        local_10 = plocal_uvar_8 + 4;
        do {
          local_uvar_1 = *(uint8_t *)((int64_t)param_3 + local_var_6 + 8);
          if (local_20 == local_10) {
            sub_0x0b478(&local_20,local_10,1,1,1);
          }
          local_18[(int64_t)local_10] = local_uvar_1;
          local_10 = local_10 + 1;
          local_var_6 = local_var_6 + 1;
          plocal_uvar_8 = local_10;
        } while (local_var_6 != 0x20);
        goto LAB_ram_0000a8f8;
      }
      plocal_uvar_8 = (uint8_t *)0x0;
      if (local_20 < (uint8_t *)0x4) {
        sub_0x0b478(&local_20,0,4,1,1);
        plocal_uvar_8 = local_10;
      }
      *(uint32_t *)(local_18 + (int64_t)plocal_uvar_8) = 2;
      goto LAB_ram_0000a8a8;
    }
    if (local_uvar_5 == 3) {
      local_var_6 = 0;
      plocal_uvar_8 = (uint8_t *)0x0;
      if (local_20 < (uint8_t *)0x4) {
        sub_0x0b478(&local_20,0,4,1,1);
        plocal_uvar_8 = local_10;
      }
      *(uint32_t *)(local_18 + (int64_t)plocal_uvar_8) = 3;
      local_10 = plocal_uvar_8 + 4;
      do {
        local_uvar_1 = *(uint8_t *)((int64_t)param_3 + local_var_6 + 0x18);
        if (local_20 == local_10) {
          sub_0x0b478(&local_20,local_10,1,1,1);
        }
        local_18[(int64_t)local_10] = local_uvar_1;
        local_10 = local_10 + 1;
        local_var_6 = local_var_6 + 1;
      } while (local_var_6 != 0x20);
      local_uvar_3 = param_3[2];
      local_uvar_5 = param_3[1];
      if ((uint64_t)((int64_t)local_20 - (int64_t)local_10) < 8) {
        sub_0x0b478(&local_20,local_10,8,1,1);
      }
      *(uint64_t *)(local_18 + (int64_t)local_10) = local_uvar_3;
      local_10 = local_10 + 8;
      if ((uint64_t)((int64_t)local_20 - (int64_t)local_10) < local_uvar_3) {
        sub_0x0b478(&local_20,local_10,local_uvar_3,1,1);
      }
      plocal_uvar_8 = local_10;
      sub_0x193a8(local_18 + (int64_t)local_10,local_uvar_5,local_uvar_3);
      local_10 = plocal_uvar_8 + local_uvar_3;
      local_uvar_5 = param_3[7];
      if ((uint64_t)((int64_t)local_20 - (int64_t)local_10) < 8) {
        sub_0x0b478(&local_20,local_10,8,1,1);
      }
      *(uint64_t *)(local_18 + (int64_t)local_10) = local_uvar_5;
      local_10 = local_10 + 8;
      local_uvar_5 = param_3[8];
      if ((uint64_t)((int64_t)local_20 - (int64_t)local_10) < 8) {
        sub_0x0b478(&local_20,local_10,8,1,1);
      }
      *(uint64_t *)(local_18 + (int64_t)local_10) = local_uvar_5;
      local_var_6 = 0;
      local_10 = local_10 + 8;
      do {
        local_uvar_1 = *(uint8_t *)((int64_t)param_3 + local_var_6 + 0x48);
        if (local_20 == local_10) {
          sub_0x0b478(&local_20,local_10,1,1,1);
        }
        local_18[(int64_t)local_10] = local_uvar_1;
        local_10 = local_10 + 1;
        local_var_6 = local_var_6 + 1;
        plocal_uvar_8 = local_10;
      } while (local_var_6 != 0x20);
      goto LAB_ram_0000a8f8;
    }
    if (local_uvar_5 == 4) {
      if (local_20 < (uint8_t *)0x4) {
        sub_0x0b478(&local_20,0,4,1,1);
      }
      *(uint32_t *)(local_18 + (int64_t)local_10) = 4;
      goto LAB_ram_0000a3c8;
    }
    local_uvar_5 = param_3[1];
    if (local_20 < (uint8_t *)0x4) {
      sub_0x0b478(&local_20,0,4,1,1);
    }
    else {
      local_10 = (uint8_t *)0x0;
    }
    *(uint32_t *)(local_18 + (int64_t)local_10) = 5;
    local_10 = local_10 + 4;
    local_uvar_3 = (int64_t)local_20 - (int64_t)local_10;
  }
  if (local_uvar_3 < 8) {
    sub_0x0b478(&local_20,local_10,8,1,1);
  }
  *(uint64_t *)(local_18 + (int64_t)local_10) = local_uvar_5;
  plocal_uvar_8 = local_10 + 8;
LAB_ram_0000a8f8:
  while (local_20 == (uint8_t *)0x8000000000000000) {
    local_20 = local_18;
    sub_0x13830(&DAT_ram_0001a6bc,0x2b,&local_20,&DAT_ram_0001d750,&DAT_ram_0001d770);
LAB_ram_0000aab0:
    sub_0x0b478(&local_20,0,4,1,1);
    plocal_uvar_8 = local_10;
LAB_ram_0000a3e8:
    *(uint32_t *)(local_18 + (int64_t)plocal_uvar_8) = 0;
    local_10 = plocal_uvar_8 + 4;
    local_uvar_5 = local_28[5];
    if ((uint64_t)((int64_t)local_20 - (int64_t)local_10) < 8) {
      sub_0x0b478(&local_20,local_10,8,1,1);
    }
    *(uint64_t *)(local_18 + (int64_t)local_10) = local_uvar_5;
    local_10 = local_10 + 8;
    local_uvar_5 = local_28[6];
    if ((uint64_t)((int64_t)local_20 - (int64_t)local_10) < 8) {
      sub_0x0b478(&local_20,local_10,8,1,1);
    }
    *(uint64_t *)(local_18 + (int64_t)local_10) = local_uvar_5;
    local_var_6 = 0;
    local_10 = local_10 + 8;
    do {
      local_uvar_1 = *(uint8_t *)((int64_t)local_28 + local_var_6 + 8);
      if (local_20 == local_10) {
        sub_0x0b478(&local_20,local_10,1,1,1);
      }
      local_18[(int64_t)local_10] = local_uvar_1;
      plocal_uvar_8 = local_10 + 1;
      local_var_6 = local_var_6 + 1;
      local_10 = plocal_uvar_8;
    } while (local_var_6 != 0x20);
  }
  input[9] = param_2[3];
  input[8] = param_2[2];
  input[7] = param_2[1];
  input[6] = *param_2;
  *input = *param_4;
  input[1] = param_4[1];
  input[2] = param_4[2];
  input[5] = plocal_uvar_8;
  input[4] = local_18;
  input[3] = local_20;
  return;
}



/* Function: sub_0x0b340 @ 0xb340 */

/* WARNING: Removing unreachable block (ram,0x0000b450) */

void sub_0x0b340(uint64_t *input,int64_t param_2,int64_t param_3,uint64_t *param_4)

{
  int64_t local_var_1;
  int64_t local_var_2;
  uint64_t local_uvar_3;
  
  if ((param_4[1] == 0) || (param_4[2] == 0)) {
    if (param_3 != 0) {
      sub_0x07428();
      local_var_2 = sub_0x041e8(param_3,param_2);
      goto joined_r0x0000b438;
    }
    local_var_1 = 0;
    local_var_2 = param_2;
  }
  else {
    local_var_2 = sub_0x04300(*param_4,param_4[2],param_2,param_3);
joined_r0x0000b438:
    local_var_1 = param_3;
    if (local_var_2 == 0) {
      local_var_2 = 0;
      goto LAB_ram_0000b3b8;
    }
  }
  if (local_var_2 != 0) {
    param_3 = local_var_1;
  }
LAB_ram_0000b3b8:
  input[2] = param_3;
  local_uvar_3 = 1;
  if ((local_var_2 != 0) && (local_uvar_3 = 0, local_var_2 != 0)) {
    local_uvar_3 = 0;
    param_2 = local_var_2;
  }
  input[1] = param_2;
  *input = local_uvar_3;
  return;
}



/* Function: sub_0x0b478 @ 0xb478 */

void sub_0x0b478(uint64_t *input,uint64_t param_2,int64_t param_3,int64_t param_4,
                     int64_t param_5)

{
  uint64_t local_uvar_1;
  uint64_t local_uvar_2;
  uint64_t local_uvar_3;
  uint64_t local_40;
  uint64_t local_38;
  int64_t local_30;
  uint64_t local_28;
  uint64_t local_20;
  uint64_t local_18;
  int64_t local_10;
  int64_t local_8;
  
  if (param_2 <= param_2 + param_3) {
    local_uvar_1 = 8;
    if (param_5 != 1) {
      local_uvar_1 = 4;
    }
    local_uvar_3 = *input;
    local_uvar_2 = param_3 + param_2;
    if (param_3 + param_2 <= local_uvar_3 << 1) {
      local_uvar_2 = local_uvar_3 << 1;
    }
    if (local_uvar_2 <= local_uvar_1) {
      local_uvar_2 = local_uvar_1;
    }
    sub_0x19f78(&local_40,(param_4 + param_5) - 1U & -param_4,0,local_uvar_2,0);
    param_2 = local_38;
    if (local_38 == 0) {
      if (0x8000000000000000U - param_4 < local_40) {
                    /* WARNING: Subroutine does not return */
        sub_0x12600(0,0,&DAT_ram_0001d788);
      }
      local_10 = 0;
      if (local_uvar_3 != 0) {
        local_8 = local_uvar_3 * param_5;
        local_18 = input[1];
        local_10 = param_4;
      }
      sub_0x0b340(&local_30,param_4,local_40,&local_18);
      if (local_30 == 1) {
                    /* WARNING: Subroutine does not return */
        sub_0x12600(local_28,local_20,&DAT_ram_0001d788);
      }
      *input = local_uvar_2;
      input[1] = local_28;
      return;
    }
  }
                    /* WARNING: Subroutine does not return */
  sub_0x12600(0,param_2,&DAT_ram_0001d788);
}



/* Function: sub_0x0b9f8 @ 0xb9f8 */

void sub_0x0b9f8(uint64_t input,uint64_t *param_2,uint64_t *param_3,uint64_t param_4,
                     int64_t param_5)

{
  uint64_t *plocal_uvar_1;
  uint64_t local_80;
  uint64_t *local_78;
  uint64_t local_70;
  uint64_t local_68;
  uint64_t local_60;
  uint64_t local_58;
  uint64_t local_50;
  uint64_t local_48;
  uint64_t local_40;
  uint64_t local_38;
  
  sub_0x07428();
  local_78 = (uint64_t *)sub_0x041e8(0x44,1);
  if (local_78 != (uint64_t *)0x0) {
    plocal_uvar_1 = *(uint64_t **)(param_5 + -0xff8);
    local_38 = *(uint64_t *)(param_5 + -0x1000);
    local_78[3] = param_2[3];
    local_78[2] = param_2[2];
    local_78[1] = param_2[1];
    *local_78 = *param_2;
    *(uint16_t *)(local_78 + 4) = 0x101;
    *(uint64_t *)((int64_t)local_78 + 0x22) = *param_3;
    *(uint64_t *)((int64_t)local_78 + 0x2a) = param_3[1];
    *(uint64_t *)((int64_t)local_78 + 0x32) = param_3[2];
    *(uint64_t *)((int64_t)local_78 + 0x3a) = param_3[3];
    *(uint16_t *)((int64_t)local_78 + 0x42) = 0x101;
    local_70 = 2;
    local_80 = 2;
    local_60 = *plocal_uvar_1;
    local_58 = plocal_uvar_1[1];
    local_50 = plocal_uvar_1[2];
    local_48 = plocal_uvar_1[3];
    local_68 = 0x8000000000000000;
    local_40 = param_4;
    sub_0x08f18(input,"",&local_68,&local_80);
    return;
  }
                    /* WARNING: Subroutine does not return */
  sub_0x12620(1,0x44);
}



/* Function: sub_0x0bbc8 @ 0xbbc8 */

void sub_0x0bbc8(uint64_t input,uint64_t *param_2,uint64_t *param_3)

{
  uint64_t local_80;
  uint64_t *local_78;
  uint64_t local_70;
  uint64_t local_68;
  uint64_t local_60;
  uint64_t local_58;
  uint64_t local_50;
  uint64_t local_48;
  
  sub_0x07428();
  local_78 = (uint64_t *)sub_0x041e8(0x22,1);
  if (local_78 != (uint64_t *)0x0) {
    local_78[3] = param_2[3];
    local_78[2] = param_2[2];
    local_78[1] = param_2[1];
    *local_78 = *param_2;
    *(uint16_t *)(local_78 + 4) = 0x101;
    local_70 = 1;
    local_80 = 1;
    local_48 = param_3[3];
    local_50 = param_3[2];
    local_58 = param_3[1];
    local_60 = *param_3;
    local_68 = 0x8000000000000001;
    sub_0x08f18(input,"",&local_68,&local_80);
    return;
  }
                    /* WARNING: Subroutine does not return */
  sub_0x12620(1,0x22);
}



/* Function: sub_0x0bd20 @ 0xbd20 */

void sub_0x0bd20(uint64_t input,uint64_t *param_2,uint64_t *param_3,uint64_t param_4)

{
  uint64_t local_80;
  uint64_t *local_78;
  uint64_t local_70;
  uint64_t local_68;
  uint64_t local_60;
  
  sub_0x07428();
  local_78 = (uint64_t *)sub_0x041e8(0x44,1);
  if (local_78 != (uint64_t *)0x0) {
    local_78[3] = param_2[3];
    local_78[2] = param_2[2];
    local_78[1] = param_2[1];
    *local_78 = *param_2;
    *(uint16_t *)(local_78 + 4) = 0x101;
    *(uint64_t *)((int64_t)local_78 + 0x22) = *param_3;
    *(uint64_t *)((int64_t)local_78 + 0x2a) = param_3[1];
    *(uint64_t *)((int64_t)local_78 + 0x32) = param_3[2];
    *(uint64_t *)((int64_t)local_78 + 0x3a) = param_3[3];
    *(uint16_t *)((int64_t)local_78 + 0x42) = 0x100;
    local_70 = 2;
    local_80 = 2;
    local_68 = 0x8000000000000002;
    local_60 = param_4;
    sub_0x08f18(input,"",&local_68,&local_80);
    return;
  }
                    /* WARNING: Subroutine does not return */
  sub_0x12620(1,0x44);
}



/* Function: sub_0x0be90 @ 0xbe90 */

void sub_0x0be90(uint64_t input,uint64_t *param_2,uint64_t param_3)

{
  uint64_t local_80;
  uint64_t *local_78;
  uint64_t local_70;
  uint64_t local_68;
  uint64_t local_60;
  
  sub_0x07428();
  local_78 = (uint64_t *)sub_0x041e8(0x22,1);
  if (local_78 != (uint64_t *)0x0) {
    local_78[3] = param_2[3];
    local_78[2] = param_2[2];
    local_78[1] = param_2[1];
    *local_78 = *param_2;
    *(uint16_t *)(local_78 + 4) = 0x101;
    local_70 = 1;
    local_80 = 1;
    local_68 = 0x8000000000000008;
    local_60 = param_3;
    sub_0x08f18(input,"",&local_68,&local_80);
    return;
  }
                    /* WARNING: Subroutine does not return */
  sub_0x12620(1,0x22);
}



/* Function: sub_0x0bfb0 @ 0xbfb0 */

uint64_t sub_0x0bfb0(uint input,uint64_t param_2)

{
  if (input < 0xd) {
    if (input < 6) {
      if (input < 3) {
        if (input == 0) {
          param_2 = param_2 & 0xffffffff;
          if (param_2 == 0) {
            param_2 = 0x100000000;
          }
        }
        else {
          param_2 = 0x200000000;
          if (input != 1) {
            param_2 = 0x300000000;
          }
        }
      }
      else if (input == 3) {
        param_2 = 0x400000000;
      }
      else if (input == 4) {
        param_2 = 0x500000000;
      }
      else {
        param_2 = 0x600000000;
      }
    }
    else if (input < 9) {
      if (input == 6) {
        param_2 = 0x700000000;
      }
      else if (input == 7) {
        param_2 = 0x800000000;
      }
      else {
        param_2 = 0x900000000;
      }
    }
    else if (input < 0xb) {
      if (input == 9) {
        param_2 = 0xa00000000;
      }
      else {
        param_2 = 0xb00000000;
      }
    }
    else if (input == 0xb) {
      param_2 = 0xc00000000;
    }
    else {
      param_2 = 0xd00000000;
    }
  }
  else if (input < 0x13) {
    if (input < 0x10) {
      if (input == 0xd) {
        param_2 = 0xe00000000;
      }
      else if (input == 0xe) {
        param_2 = 0xf00000000;
      }
      else {
        param_2 = 0x1000000000;
      }
    }
    else if (input == 0x10) {
      param_2 = 0x1100000000;
    }
    else if (input == 0x11) {
      param_2 = 0x1200000000;
    }
    else {
      param_2 = 0x1300000000;
    }
  }
  else if (input < 0x16) {
    if (input == 0x13) {
      param_2 = 0x1400000000;
    }
    else if (input == 0x14) {
      param_2 = 0x1500000000;
    }
    else {
      param_2 = 0x1600000000;
    }
  }
  else if (input < 0x18) {
    if (input == 0x16) {
      param_2 = 0x1700000000;
    }
    else {
      param_2 = 0x1800000000;
    }
  }
  else if (input == 0x18) {
    param_2 = 0x1900000000;
  }
  else {
    param_2 = 0x1a00000000;
  }
  return param_2;
}



/* Function: sub_0x0c3f8 @ 0xc3f8 */

void sub_0x0c3f8(void)

{
  sub_0x146f8();
  return;
}



/* Function: sub_0x0cf00 @ 0xcf00 */

void sub_0x0cf00(int64_t *input,uint64_t param_2,int64_t param_3)

{
  int64_t local_var_1;
  uint64_t local_uvar_2;
  
  local_uvar_2 = 0;
  if (-1 < param_3) {
    if (param_3 == 0) {
      local_var_1 = 1;
    }
    else {
      sub_0x07428(0);
      local_var_1 = sub_0x041e8(param_3,1);
      local_uvar_2 = 1;
      if (local_var_1 == 0) goto LAB_ram_0000cf20;
    }
    sub_0x193a8(local_var_1,param_2,param_3);
    input[1] = local_var_1;
    input[2] = param_3;
    *input = param_3;
    return;
  }
LAB_ram_0000cf20:
                    /* WARNING: Subroutine does not return */
  sub_0x12600(local_uvar_2,param_3,&DAT_ram_0001d950);
}



/* Function: sub_0x0cfd8 @ 0xcfd8 */

void sub_0x0cfd8(uint64_t *input,uint64_t param_2)

{
  int64_t local_var_1;
  
  sub_0x07428();
  local_var_1 = sub_0x041e8(0xa0,8);
  if (local_var_1 != 0) {
    sub_0x193a8(local_var_1,param_2,0xa0);
    input[1] = local_var_1;
    *input = 0;
    return;
  }
                    /* WARNING: Subroutine does not return */
  sub_0x12620(8,0xa0);
}



/* Function: sub_0x0d068 @ 0xd068 */

void sub_0x0d068(uint64_t *input,uint32_t param_2,uint32_t param_3)

{
  uint64_t *plocal_uvar_1;
  
  sub_0x07428();
  plocal_uvar_1 = (uint64_t *)sub_0x041e8(0x70,8);
  if (plocal_uvar_1 != (uint64_t *)0x0) {
    *(uint32_t *)((int64_t)plocal_uvar_1 + 0x24) = param_3;
    *(uint32_t *)(plocal_uvar_1 + 4) = param_2;
    *(uint8_t *)(plocal_uvar_1 + 5) = 2;
    *plocal_uvar_1 = 2;
    input[1] = plocal_uvar_1;
    *input = 1;
    return;
  }
                    /* WARNING: Subroutine does not return */
  sub_0x12620(8,0x70);
}



/* Function: sub_0x0d0f8 @ 0xd0f8 */

void sub_0x0d0f8(int64_t *input)

{
  if (*input == 1) {
    sub_0x0d328();
  }
  else {
    sub_0x0d9d0(input[1]);
  }
  return;
}



/* Function: sub_0x0d138 @ 0xd138 */

void sub_0x0d138(uint64_t *input,uint64_t param_2,uint64_t param_3,uint64_t *param_4)

{
  int64_t local_var_1;
  uint64_t local_40;
  uint64_t local_38;
  uint64_t local_30;
  uint64_t local_28;
  uint64_t local_20;
  uint64_t local_18;
  uint64_t local_10;
  uint64_t local_8;
  
  local_8 = param_4[7];
  local_10 = param_4[6];
  local_18 = param_4[5];
  local_20 = param_4[4];
  local_40 = *param_4;
  local_38 = param_4[1];
  local_30 = param_4[2];
  local_28 = param_4[3];
  if ((param_2 & 1) == 0) {
    if ((*(char *)(param_3 + 0x50) != '\x02') && (*(char *)(param_3 + 0x50) == '\0')) {
      if (*(int64_t *)(param_3 + 0x58) != 0) {
        sub_0x042f8(*(uint64_t *)(param_3 + 0x60),*(int64_t *)(param_3 + 0x58),1);
      }
      if (*(int64_t *)(param_3 + 0x70) != 0) {
        sub_0x042f8(*(uint64_t *)(param_3 + 0x78),*(int64_t *)(param_3 + 0x70),1);
      }
    }
    *(uint8_t *)(param_3 + 0x50) = 1;
    local_var_1 = 0x51;
  }
  else {
    if ((*(char *)(param_3 + 0x28) != '\x02') && (*(char *)(param_3 + 0x28) == '\0')) {
      if (*(int64_t *)(param_3 + 0x30) != 0) {
        sub_0x042f8(*(uint64_t *)(param_3 + 0x38),*(int64_t *)(param_3 + 0x30),1);
      }
      if (*(int64_t *)(param_3 + 0x48) != 0) {
        sub_0x042f8(*(uint64_t *)(param_3 + 0x50),*(int64_t *)(param_3 + 0x48),1);
      }
    }
    *(uint8_t *)(param_3 + 0x28) = 1;
    local_var_1 = 0x29;
  }
  sub_0x193a8(param_3 + local_var_1,&local_40,0x40);
  *input = param_2;
  input[1] = param_3;
  return;
}



/* Function: sub_0x0d328 @ 0xd328 */

void sub_0x0d328(uint64_t *input)

{
  uint64_t **local_a8;
  uint8_t *local_a0;
  uint64_t *local_98;
  uint8_t *local_90;
  uint64_t **local_88;
  uint8_t *local_80;
  uint64_t *local_78;
  uint8_t *local_70;
  uint64_t **local_68;
  uint8_t *local_60;
  uint8_t auStack_58 [24];
  uint8_t *local_40;
  uint64_t local_38;
  uint64_t **local_30;
  uint64_t local_28;
  uint64_t local_20;
  uint64_t *local_10;
  uint64_t *local_8;
  
  if (*input == 2) {
    local_8 = (uint64_t *)
              sub_0x0bfb0((int)input[4],*(uint32_t *)((int64_t)input + 0x24));
    local_40 = &DAT_ram_0001d968;
    local_80 = &LAB_ram_00011268;
    local_90 = &LAB_ram_00018960;
    local_98 = (uint64_t *)&local_8;
    local_a0 = &LAB_ram_0000caa0;
    local_a8 = (uint64_t **)(input + 4);
    local_38 = 4;
    local_28 = 3;
    local_88 = local_a8;
  }
  else if ((*input & 1) == 0) {
    local_8 = (uint64_t *)
              sub_0x0bfb0((int)input[4],*(uint32_t *)((int64_t)input + 0x24));
    local_40 = &DAT_ram_0001d9a8;
    local_60 = &LAB_ram_00011268;
    local_70 = &LAB_ram_00018960;
    local_78 = (uint64_t *)&local_8;
    local_80 = &LAB_ram_0000caa0;
    local_88 = (uint64_t **)(input + 4);
    local_90 = &LAB_ram_00018490;
    local_98 = input + 3;
    local_a0 = &LAB_ram_0000c3a8;
    local_a8 = (uint64_t **)(input + 1);
    local_38 = 6;
    local_28 = 5;
    local_68 = local_88;
  }
  else {
    local_10 = input + 1;
    local_8 = (uint64_t *)
              sub_0x0bfb0((int)input[4],*(uint32_t *)((int64_t)input + 0x24));
    local_40 = &DAT_ram_0001da08;
    local_70 = &LAB_ram_00011268;
    local_80 = &LAB_ram_00018960;
    local_88 = &local_8;
    local_90 = &LAB_ram_0000caa0;
    local_98 = input + 4;
    local_a0 = &LAB_ram_0000c378;
    local_a8 = &local_10;
    local_38 = 5;
    local_28 = 4;
    local_78 = local_98;
  }
  local_30 = (uint64_t **)&local_a8;
  local_20 = 0;
                    /* WARNING: Subroutine does not return */
  sub_0x126b8(auStack_58,&local_40);
}



/* Function: sub_0x0d9d0 @ 0xd9d0 */

void sub_0x0d9d0(uint64_t *input)

{
  uint64_t **local_a8;
  uint8_t *local_a0;
  uint64_t *local_98;
  uint8_t *local_90;
  uint64_t *local_88;
  uint8_t *local_80;
  uint64_t *local_78;
  uint8_t *local_70;
  uint64_t *local_68;
  uint8_t *local_60;
  uint8_t auStack_58 [24];
  uint8_t *local_40;
  uint64_t local_38;
  uint64_t **local_30;
  uint64_t local_28;
  uint64_t local_20;
  uint64_t *local_8;
  
  if (*input == 2) {
    local_40 = &DAT_ram_0001da78;
    local_88 = input + 7;
    local_90 = &LAB_ram_00018490;
    local_98 = input + 0x13;
    local_80 = &LAB_ram_0000ca78;
    local_a0 = &LAB_ram_0000ca78;
    local_a8 = (uint64_t **)(input + 4);
    local_38 = 4;
    local_28 = 3;
  }
  else if ((*input & 1) == 0) {
    local_40 = &DAT_ram_0001dab8;
    local_68 = input + 7;
    local_78 = input + 0x13;
    local_60 = &LAB_ram_0000ca78;
    local_80 = &LAB_ram_0000ca78;
    local_88 = input + 4;
    local_70 = &LAB_ram_00018490;
    local_90 = &LAB_ram_00018490;
    local_98 = input + 3;
    local_a0 = &LAB_ram_0000c3a8;
    local_a8 = (uint64_t **)(input + 1);
    local_38 = 6;
    local_28 = 5;
  }
  else {
    local_8 = input + 1;
    local_40 = &DAT_ram_0001db18;
    local_78 = input + 7;
    local_80 = &LAB_ram_00018490;
    local_88 = input + 0x13;
    local_70 = &LAB_ram_0000ca78;
    local_90 = &LAB_ram_0000ca78;
    local_98 = input + 4;
    local_a0 = &LAB_ram_0000c378;
    local_a8 = &local_8;
    local_38 = 5;
    local_28 = 4;
  }
  local_30 = (uint64_t **)&local_a8;
  local_20 = 0;
                    /* WARNING: Subroutine does not return */
  sub_0x126b8(auStack_58,&local_40);
}



/* Function: sub_0x0e008 @ 0xe008 */

void sub_0x0e008(uint32_t *input,uint64_t param_2,int64_t *param_3)

{
  int64_t local_var_1;
  uint64_t local_uvar_2;
  int64_t local_var_3;
  uint32_t local_uvar_4;
  uint32_t local_uvar_5;
  
  if ((param_2 & 1) == 0) {
    local_uvar_4 = (uint32_t)param_3[0x13];
    if (param_3[4] != 0) {
      sub_0x042f8(param_3[5],param_3[4],1);
    }
    if (param_3[7] != 0) {
      sub_0x042f8(param_3[8],param_3[7],1);
    }
    if (((*param_3 != 2) && (*param_3 != 0)) && (param_3[1] != 0)) {
      sub_0x042f8(param_3[2],param_3[1],1);
    }
    local_uvar_5 = 0;
    local_uvar_2 = 0xa0;
    if (((char)param_3[10] == '\x02') || ((char)param_3[10] != '\0')) goto LAB_ram_0000e230;
    if (param_3[0xb] != 0) {
      sub_0x042f8(param_3[0xc],param_3[0xb],1);
    }
    local_var_1 = 0x78;
    local_uvar_2 = 0xa0;
    local_var_3 = param_3[0xe];
  }
  else {
    local_uvar_4 = *(uint32_t *)((int64_t)param_3 + 0x24);
    local_uvar_5 = (uint32_t)param_3[4];
    if (((*param_3 != 2) && (*param_3 != 0)) && (param_3[1] != 0)) {
      sub_0x042f8(param_3[2],param_3[1],1);
    }
    local_uvar_2 = 0x70;
    if (((char)param_3[5] == '\x02') || ((char)param_3[5] != '\0')) goto LAB_ram_0000e230;
    if (param_3[6] != 0) {
      sub_0x042f8(param_3[7],param_3[6],1);
    }
    local_var_1 = 0x50;
    local_uvar_2 = 0x70;
    local_var_3 = param_3[9];
  }
  if (local_var_3 != 0) {
    sub_0x042f8(*(uint64_t *)((int64_t)param_3 + local_var_1),local_var_3,1);
  }
LAB_ram_0000e230:
  sub_0x042f8(param_3,local_uvar_2,8);
  input[1] = local_uvar_4;
  *input = local_uvar_5;
  return;
}



/* Function: sub_0x0e260 @ 0xe260 */

void sub_0x0e260(uint64_t input,uint *param_2)

{
  uint local_uvar_1;
  char *pcVar2;
  uint64_t local_uvar_3;
  
  local_uvar_1 = *param_2;
  if (local_uvar_1 < 0x7f0) {
    if (local_uvar_1 < 0x7dc) {
      if (local_uvar_1 < 0x7d2) {
        if (local_uvar_1 < 0x3e9) {
          if (local_uvar_1 < 0x66) {
            if (local_uvar_1 == 100) {
              pcVar2 = 
              "InstructionMissingInstructionFallbackNotFoundInstructionDidNotDeserializeInstructionDidNotSerializeIdlInstructionStubIdlInstructionInvalidProgramIdlAccountNotEmptyEventInstructionStubConstraintMutConstraintRawConstraintOwnerConstraintRentExemptConstraintSeedsConstraintExecutableConstraintStateConstraintAssociatedConstraintAssociatedInitConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not suppo..." /* TRUNCATED STRING LITERAL */
              ;
              local_uvar_3 = 0x12;
            }
            else {
              pcVar2 = 
              "InstructionFallbackNotFoundInstructionDidNotDeserializeInstructionDidNotSerializeIdlInstructionStubIdlInstructionInvalidProgramIdlAccountNotEmptyEventInstructionStubConstraintMutConstraintRawConstraintOwnerConstraintRentExemptConstraintSeedsConstraintExecutableConstraintStateConstraintAssociatedConstraintAssociatedInitConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program co..." /* TRUNCATED STRING LITERAL */
              ;
              local_uvar_3 = 0x1b;
            }
          }
          else if (local_uvar_1 == 0x66) {
            pcVar2 = 
            "InstructionDidNotDeserializeInstructionDidNotSerializeIdlInstructionStubIdlInstructionInvalidProgramIdlAccountNotEmptyEventInstructionStubConstraintMutConstraintRawConstraintOwnerConstraintRentExemptConstraintSeedsConstraintExecutableConstraintStateConstraintAssociatedConstraintAssociatedInitConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the giv..." /* TRUNCATED STRING LITERAL */
            ;
            local_uvar_3 = 0x1c;
          }
          else if (local_uvar_1 == 0x67) {
            pcVar2 = 
            "InstructionDidNotSerializeIdlInstructionStubIdlInstructionInvalidProgramIdlAccountNotEmptyEventInstructionStubConstraintMutConstraintRawConstraintOwnerConstraintRentExemptConstraintSeedsConstraintExecutableConstraintStateConstraintAssociatedConstraintAssociatedInitConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program co..." /* TRUNCATED STRING LITERAL */
            ;
            local_uvar_3 = 0x1a;
          }
          else {
            pcVar2 = 
            "IdlInstructionStubIdlInstructionInvalidProgramIdlAccountNotEmptyEventInstructionStubConstraintMutConstraintRawConstraintOwnerConstraintRentExemptConstraintSeedsConstraintExecutableConstraintStateConstraintAssociatedConstraintAssociatedInitConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the give..." /* TRUNCATED STRING LITERAL */
            ;
            local_uvar_3 = 0x12;
          }
        }
        else if (local_uvar_1 < 0x5dc) {
          if (local_uvar_1 == 0x3e9) {
            pcVar2 = 
            "IdlInstructionInvalidProgramIdlAccountNotEmptyEventInstructionStubConstraintMutConstraintRawConstraintOwnerConstraintRentExemptConstraintSeedsConstraintExecutableConstraintStateConstraintAssociatedConstraintAssociatedInitConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe p..." /* TRUNCATED STRING LITERAL */
            ;
            local_uvar_3 = 0x1c;
          }
          else {
            pcVar2 = 
            "IdlAccountNotEmptyEventInstructionStubConstraintMutConstraintRawConstraintOwnerConstraintRentExemptConstraintSeedsConstraintExecutableConstraintStateConstraintAssociatedConstraintAssociatedInitConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without ..." /* TRUNCATED STRING LITERAL */
            ;
            local_uvar_3 = 0x12;
          }
        }
        else if (local_uvar_1 == 0x5dc) {
          pcVar2 = 
          "EventInstructionStubConstraintMutConstraintRawConstraintOwnerConstraintRentExemptConstraintSeedsConstraintExecutableConstraintStateConstraintAssociatedConstraintAssociatedInitConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsIn..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0x14;
        }
        else if (local_uvar_1 == 2000) {
          pcVar2 = 
          "ConstraintMutConstraintRawConstraintOwnerConstraintRentExemptConstraintSeedsConstraintExecutableConstraintStateConstraintAssociatedConstraintAssociatedInitConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given ..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0xd;
        }
        else {
          pcVar2 = 
          "ConstraintHasOneConstraintSigner) when slicing `range end index . Error Number: \x01";
          local_uvar_3 = 0x10;
        }
      }
      else if (local_uvar_1 < 0x7d7) {
        if (local_uvar_1 < 0x7d4) {
          if (local_uvar_1 == 0x7d2) {
            pcVar2 = "ConstraintSigner) when slicing `range end index . Error Number: \x01";
            local_uvar_3 = 0x10;
          }
          else {
            pcVar2 = 
            "ConstraintRawConstraintOwnerConstraintRentExemptConstraintSeedsConstraintExecutableConstraintStateConstraintAssociatedConstraintAssociatedInitConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL in..." /* TRUNCATED STRING LITERAL */
            ;
            local_uvar_3 = 0xd;
          }
        }
        else if (local_uvar_1 == 0x7d4) {
          pcVar2 = 
          "ConstraintOwnerConstraintRentExemptConstraintSeedsConstraintExecutableConstraintStateConstraintAssociatedConstraintAssociatedInitConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL ..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0xf;
        }
        else if (local_uvar_1 == 0x7d5) {
          pcVar2 = 
          "ConstraintRentExemptConstraintSeedsConstraintExecutableConstraintStateConstraintAssociatedConstraintAssociatedInitConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0x14;
        }
        else {
          pcVar2 = 
          "ConstraintSeedsConstraintExecutableConstraintStateConstraintAssociatedConstraintAssociatedInitConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to r..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0xf;
        }
      }
      else if (local_uvar_1 < 0x7d9) {
        if (local_uvar_1 == 0x7d7) {
          pcVar2 = 
          "ConstraintExecutableConstraintStateConstraintAssociatedConstraintAssociatedInitConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try clos..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0x14;
        }
        else {
          pcVar2 = 
          "ConstraintStateConstraintAssociatedConstraintAssociatedInitConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0xf;
        }
      }
      else if (local_uvar_1 == 0x7d9) {
        pcVar2 = 
        "ConstraintAssociatedConstraintAssociatedInitConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled w..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x14;
      }
      else if (local_uvar_1 == 0x7da) {
        pcVar2 = 
        "ConstraintAssociatedInitConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` f..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x18;
      }
      else {
        pcVar2 = 
        "ConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint w..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0xf;
      }
    }
    else if (local_uvar_1 < 0x7e6) {
      if (local_uvar_1 < 0x7e1) {
        if (local_uvar_1 < 0x7de) {
          if (local_uvar_1 == 0x7dc) {
            pcVar2 = 
            "ConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA ha..." /* TRUNCATED STRING LITERAL */
            ;
            local_uvar_3 = 0x11;
          }
          else {
            pcVar2 = 
            "ConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint ..." /* TRUNCATED STRING LITERAL */
            ;
            local_uvar_3 = 0xe;
          }
        }
        else if (local_uvar_1 == 0x7de) {
          pcVar2 = 
          "ConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA ..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0x13;
        }
        else if (local_uvar_1 == 0x7df) {
          pcVar2 = 
          "ConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was ..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0x14;
        }
        else {
          pcVar2 = 
          "ConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemp..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0x1b;
        }
      }
      else if (local_uvar_1 < 0x7e3) {
        if (local_uvar_1 == 0x7e1) {
          pcVar2 = 
          "ConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violate..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0x1d;
        }
        else {
          pcVar2 = 
          "ConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was viola..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0x16;
        }
      }
      else if (local_uvar_1 == 0x7e3) {
        pcVar2 = 
        "ConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable const..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0xf;
      }
      else if (local_uvar_1 == 0x7e4) {
        pcVar2 = 
        "ConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was viola..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x17;
      }
      else {
        pcVar2 = 
        "ConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, fe..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x1b;
      }
    }
    else if (local_uvar_1 < 0x7eb) {
      if (local_uvar_1 < 0x7e8) {
        if (local_uvar_1 == 0x7e6) {
          pcVar2 = 
          "ConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with som..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0x1a;
        }
        else {
          pcVar2 = 
          "ConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated c..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0x25;
        }
      }
      else if (local_uvar_1 == 0x7e8) {
        pcVar2 = 
        "ConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated i..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x23;
      }
      else if (local_uvar_1 == 0x7e9) {
        pcVar2 = 
        "ConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close ..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x2c;
      }
      else {
        pcVar2 = 
        "ConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x2f;
      }
    }
    else if (local_uvar_1 < 0x7ed) {
      if (local_uvar_1 == 0x7eb) {
        pcVar2 = 
        "ConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminant..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x29;
      }
      else {
        pcVar2 = 
        "ConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA tok..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x32;
      }
    }
    else if (local_uvar_1 == 0x7ed) {
      pcVar2 = 
      "ConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint author..." /* TRUNCATED STRING LITERAL */
      ;
      local_uvar_3 = 0x36;
    }
    else if (local_uvar_1 == 0x7ee) {
      pcVar2 = 
      "ConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority con..." /* TRUNCATED STRING LITERAL */
      ;
      local_uvar_3 = 0x26;
    }
    else {
      pcVar2 = 
      "ConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals co..." /* TRUNCATED STRING LITERAL */
      ;
      local_uvar_3 = 0x2f;
    }
  }
  else if (local_uvar_1 < 0xbba) {
    if (local_uvar_1 < 0x7fa) {
      if (local_uvar_1 < 0x7f5) {
        if (local_uvar_1 < 0x7f2) {
          if (local_uvar_1 == 0x7f0) {
            pcVar2 = 
            "ConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was vio..." /* TRUNCATED STRING LITERAL */
            ;
            local_uvar_3 = 0x35;
          }
          else {
            pcVar2 = 
            "ConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA t..." /* TRUNCATED STRING LITERAL */
            ;
            local_uvar_3 = 0x25;
          }
        }
        else if (local_uvar_1 == 0x7f2) {
          pcVar2 = 
          "ConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0x2e;
        }
        else if (local_uvar_1 == 0x7f3) {
          pcVar2 = 
          "ConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint w..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0x28;
        }
        else {
          pcVar2 = 
          "ConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account t..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0x30;
        }
      }
      else if (local_uvar_1 < 0x7f7) {
        if (local_uvar_1 == 0x7f5) {
          pcVar2 = 
          "ConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group poin..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0x23;
        }
        else {
          pcVar2 = 
          "ConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violat..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0x2c;
        }
      }
      else if (local_uvar_1 == 0x7f7) {
        pcVar2 = 
        "ConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constr..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x2c;
      }
      else if (local_uvar_1 == 0x7f8) {
        pcVar2 = 
        "ConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension g..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x21;
      }
      else {
        pcVar2 = 
        "AccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was viola..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x16;
      }
    }
    else if (local_uvar_1 < 0x9c8) {
      if (local_uvar_1 < 0x9c5) {
        if (local_uvar_1 == 0x7fa) {
          pcVar2 = 
          "AccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member poin..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0x12;
        }
        else {
          pcVar2 = 
          "RequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension cons..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0xf;
        }
      }
      else if (local_uvar_1 == 0x9c5) {
        pcVar2 = 
        "RequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was viol..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x11;
      }
      else if (local_uvar_1 == 0x9c6) {
        pcVar2 = 
        "RequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group membe..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x15;
      }
      else {
        pcVar2 = 
        "RequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension a..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x12;
      }
    }
    else if (local_uvar_1 < 0x9ca) {
      if (local_uvar_1 == 0x9c8) {
        pcVar2 = 
        "RequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constrain..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x16;
      }
      else {
        pcVar2 = 
        "RequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group ..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x11;
      }
    }
    else if (local_uvar_1 == 0x9ca) {
      pcVar2 = 
      "RequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer ex..." /* TRUNCATED STRING LITERAL */
      ;
      local_uvar_3 = 0x12;
    }
    else if (local_uvar_1 == 3000) {
      pcVar2 = 
      "AccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer extension group addr..." /* TRUNCATED STRING LITERAL */
      ;
      local_uvar_3 = 0x1e;
    }
    else {
      pcVar2 = 
      "AccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer extension group address constraint was violatedA m..." /* TRUNCATED STRING LITERAL */
      ;
      local_uvar_3 = 0x1c;
    }
  }
  else if (local_uvar_1 < 0xbc4) {
    if (local_uvar_1 < 0xbbf) {
      if (local_uvar_1 < 0xbbc) {
        if (local_uvar_1 == 0xbba) {
          pcVar2 = 
          "AccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer extension group address constraint was violatedA metadata pointer extension co..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0x1c;
        }
        else {
          pcVar2 = 
          "AccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer extension group address constraint was violatedA metadata pointer extension constraint was violatedA metad..." /* TRUNCATED STRING LITERAL */
          ;
          local_uvar_3 = 0x18;
        }
      }
      else if (local_uvar_1 == 0xbbc) {
        pcVar2 = 
        "AccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer extension group address constraint was violatedA metadata pointer extension constraint was violatedA metadata pointer extension au..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x16;
      }
      else if (local_uvar_1 == 0xbbd) {
        pcVar2 = 
        "AccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer extension group address constraint was violatedA metadata pointer extension constraint was violatedA metadata pointer extension authority constraint was..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x14;
      }
      else {
        pcVar2 = 
        "AccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer extension group address constraint was violatedA metadata pointer extension constraint was violatedA metadata pointer extension authority constraint was violatedA metadata ..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x11;
      }
    }
    else if (local_uvar_1 < 0xbc1) {
      if (local_uvar_1 == 0xbbf) {
        pcVar2 = 
        "AccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer extension group address constraint was violatedA metadata pointer extension constraint was violatedA metadata pointer extension authority constraint was violatedA metadata pointer extension..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x1a;
      }
      else {
        pcVar2 = 
        "InvalidProgramIdProgramError occurred. Error Code: . Error Message: .ProgramError thrown in :. Error Code: Left: Right: Left:Right:AnchorError occurred. Error Code: AnchorError thrown in AnchorError caused by account: InstructionMissingInstructionFallbackNotFoundInstructionDidNotDeserializeInstructionDidNotSerializeIdlInstructionStubIdlInstructionInvalidProgramIdlAccountNotEmptyEventInstructionStubConstraintMutConstraintRawConstraintOwnerConstraintRentExemptConstraintSeedsConstraintExecutableConstraintStateConstraintAssociatedConstraintAssociatedInitConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMi..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x10;
      }
    }
    else if (local_uvar_1 == 0xbc1) {
      pcVar2 = 
      "InvalidProgramExecutableAccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer extension group address constraint was violatedA metadata pointer extension constraint was violatedA metadata pointer extension authority constraint was violatedA metadata pointer extension metadata address constrai..." /* TRUNCATED STRING LITERAL */
      ;
      local_uvar_3 = 0x18;
    }
    else if (local_uvar_1 == 0xbc2) {
      pcVar2 = 
      "AccountNotSignerPermissionDeniedAddrNotAvailable0123456789abcdefInvalidProgramIdProgramError occurred. Error Code: . Error Message: .ProgramError thrown in :. Error Code: Left: Right: Left:Right:AnchorError occurred. Error Code: AnchorError thrown in AnchorError caused by account: InstructionMissingInstructionFallbackNotFoundInstructionDidNotDeserializeInstructionDidNotSerializeIdlInstructionStubIdlInstructionInvalidProgramIdlAccountNotEmptyEventInstructionStubConstraintMutConstraintRawConstraintOwnerConstraintRentExemptConstraintSeedsConstraintExecutableConstraintStateConstraintAssociatedConstraintAssociatedInitConstraintCloseConstraintAddressConstraintZeroConstraintTokenMintConstraintTokenOwnerConstraintMintMintAuthorityConstraintMintFreezeAuthorityConstraintMintDecimalsConstraintSpaceConstraintAccountIsNoneConstraintTokenTokenProgramConstraintMintTokenProgramConstraintAssociatedTokenTokenProgramConstraintMintGroupPointerExtensionConstraintMintGroupPointerExtensionAuthorityConstraintMintGroupPointerExtensionGroupAddressConstraintMintGroupMemberPointerExtensionConstraintMintGroupMemberPointerExtensionAuthorityConstraintMintGroupMemberPointerExtensionMemberAddressConstraintMintMetadataPointerExtensionConstraintMintMetadataPointerExtensionAuthorityConstraintMintMetadataPointerExtensionMetadataAddressConstraintMintCloseAuthorityExtensionConstraintMintCloseAuthorityExtensionAuthorityConstraintMintPermanentDelegateExtensionConstraintMintPermanentDelegateExtensionDelegateConstraintMintTransferHookExtensionConstraintMintTransferHookExtensionAuthorityConstraintMintTransferHookExtensionProgramIdConstraintDuplicateMutableAccountAccountAlreadyMigratedAccountNotMigratedRequireViolatedRequireEqViolatedRequireKeysEqViolatedRequireNeqViolatedRequireKeysNeqViolatedRequireGtViolatedRequireGteViolatedAccountDiscriminatorAlreadySetAccountDiscriminatorNotFoundAccountDiscriminatorMismatchAccountDidNotDeserializeAccountDidNotSerializeAccountNotEnoughKeysAccountNotMutableAccountOwnedByWrongProgramInvalidProgramExecutableAccountNotSyst..." /* TRUNCATED STRING LITERAL */
      ;
      local_uvar_3 = 0x10;
    }
    else {
      pcVar2 = 
      "AccountNotSystemOwnedAccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer extension group address constraint was violatedA metadata pointer extension constraint was violatedA metadata pointer extension authority constraint was violatedA metadata pointer extension metadata address constraint was violatedA close a..." /* TRUNCATED STRING LITERAL */
      ;
      local_uvar_3 = 0x15;
    }
  }
  else if (local_uvar_1 < 0xbc9) {
    if (local_uvar_1 < 0xbc6) {
      if (local_uvar_1 == 0xbc4) {
        pcVar2 = 
        "AccountNotInitializedAccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer extension group address constraint was violatedA metadata pointer extension constraint was violatedA metadata pointer extension authority constraint was violatedA metadata pointer extension metadata address constraint was violatedA close authority constraint w..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x15;
      }
      else {
        pcVar2 = 
        "AccountNotProgramDataAccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer extension group address constraint was violatedA metadata pointer extension constraint was violatedA metadata pointer extension authority constraint was violatedA metadata pointer extension metadata address constraint was violatedA close authority constraint was violatedA close au..." /* TRUNCATED STRING LITERAL */
        ;
        local_uvar_3 = 0x15;
      }
    }
    else if (local_uvar_1 == 0xbc6) {
      pcVar2 = "AccountNotAssociatedTokenAccount";
      local_uvar_3 = 0x20;
    }
    else if (local_uvar_1 == 0xbc7) {
      pcVar2 = 
      "AccountSysvarMismatchAccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer extension group address constraint was violatedA metadata pointer extension constraint was violatedA metadata pointer extension authority constraint was violatedA metadata pointer extension metadata address constraint was violatedA close authority constraint was violatedA close authority extension aut..." /* TRUNCATED STRING LITERAL */
      ;
      local_uvar_3 = 0x15;
    }
    else {
      pcVar2 = 
      "AccountReallocExceedsLimitAccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer extension group address constraint was violatedA metadata pointer extension constraint was violatedA metadata pointer extension authority constraint was violatedA metadata pointer extension metadata address constraint was violatedA close authority constraint was violatedA close authority extension authority constraint was..." /* TRUNCATED STRING LITERAL */
      ;
      local_uvar_3 = 0x1a;
    }
  }
  else if (local_uvar_1 < 0x1005) {
    if (local_uvar_1 == 0xbc9) {
      pcVar2 = 
      "AccountDuplicateReallocsDeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer extension group address constraint was violatedA metadata pointer extension constraint was violatedA metadata pointer extension authority constraint was violatedA metadata pointer extension metadata address constraint was violatedA close authority constraint was violatedA close authority extension authority constraint was violatedA permanent deleg..." /* TRUNCATED STRING LITERAL */
      ;
      local_uvar_3 = 0x18;
    }
    else {
      pcVar2 = 
      "DeclaredProgramIdMismatchTryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer extension group address constraint was violatedA metadata pointer extension constraint was violatedA metadata pointer extension authority constraint was violatedA metadata pointer extension metadata address constraint was violatedA close authority constraint was violatedA close authority extension authority constraint was violatedA permanent delegate extension constraint..." /* TRUNCATED STRING LITERAL */
      ;
      local_uvar_3 = 0x19;
    }
  }
  else if (local_uvar_1 == 0x1005) {
    pcVar2 = 
    "TryingToInitPayerAsProgramAccountInvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer extension group address constraint was violatedA metadata pointer extension constraint was violatedA metadata pointer extension authority constraint was violatedA metadata pointer extension metadata address constraint was violatedA close authority constraint was violatedA close authority extension authority constraint was violatedA permanent delegate extension constraint was violatedA permanent ..." /* TRUNCATED STRING LITERAL */
    ;
    local_uvar_3 = 0x21;
  }
  else if (local_uvar_1 == 0x1006) {
    pcVar2 = 
    "InvalidNumericConversionDeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer extension group address constraint was violatedA metadata pointer extension constraint was violatedA metadata pointer extension authority constraint was violatedA metadata pointer extension metadata address constraint was violatedA close authority constraint was violatedA close authority extension authority constraint was violatedA permanent delegate extension constraint was violatedA permanent delegate extension delegate const..." /* TRUNCATED STRING LITERAL */
    ;
    local_uvar_3 = 0x18;
  }
  else {
    pcVar2 = 
    "DeprecatedInstruction discriminator not providedFallback functions are not supportedThe program could not deserialize the given instructionThe program could not serialize the given instructionThe program was compiled without idl instructionsInvalid program given to the IDL instructionIDL account must be empty in order to resize, try closing firstThe program was compiled without `event-cpi` featureA mut constraint was violatedA has one constraint was violatedA raw constraint was violatedA rent exemption constraint was violatedA seeds constraint was violatedAn executable constraint was violatedDeprecated Error, feel free to replace with something elseAn associated constraint was violatedAn associated init constraint was violatedA close constraint was violatedAn address constraint was violatedExpected zero account discriminantA token mint constraint was violatedA token owner constraint was violatedA mint mint authority constraint was violatedA mint freeze authority constraint was violatedA mint decimals constraint was violatedA space constraint was violatedA required account for the constraint is NoneA token account token program constraint was violatedA mint token program constraint was violatedAn associated token account token program constraint was violatedA group pointer extension constraint was violatedA group pointer extension authority constraint was violatedA group pointer extension group address constraint was violatedA group member pointer extension constraint was violatedA group member pointer extension authority constraint was violatedA group member pointer extension group address constraint was violatedA metadata pointer extension constraint was violatedA metadata pointer extension authority constraint was violatedA metadata pointer extension metadata address constraint was violatedA close authority constraint was violatedA close authority extension authority constraint was violatedA permanent delegate extension constraint was violatedA permanent delegate extension delegate constraint was violatedA tran..." /* TRUNCATED STRING LITERAL */
    ;
    local_uvar_3 = 10;
  }
  sub_0x0cf00(input,pcVar2,local_uvar_3);
  return;
}



/* Function: sub_0x0eee8 @ 0xeee8 */

void sub_0x0eee8(uint64_t *input,uint32_t param_2)

{
  int64_t local_var_1;
  uint64_t *plocal_uvar_2;
  uint32_t local_7c;
  uint64_t local_78;
  uint64_t local_70;
  uint64_t local_68;
  uint64_t local_60;
  uint64_t local_58;
  uint64_t local_50;
  uint64_t local_48;
  uint64_t local_40;
  uint64_t local_38;
  uint64_t local_30;
  uint64_t local_28;
  uint64_t local_20;
  uint64_t *local_18;
  uint8_t *local_10;
  uint64_t local_8;
  
  local_7c = param_2;
  sub_0x0e260(&local_48,&local_7c);
  local_20 = 0;
  local_28 = 1;
  local_30 = 0;
  local_10 = &DAT_ram_0001d8b0;
  local_18 = &local_30;
  local_8 = 0xe0000020;
  local_var_1 = sub_0x0f138(&local_7c,&local_18);
  if (local_var_1 == 0) {
    local_68 = local_20;
    local_70 = local_28;
    local_78 = local_30;
    local_60 = local_48;
    local_58 = local_40;
    local_50 = local_38;
    sub_0x07428();
    plocal_uvar_2 = (uint64_t *)sub_0x041e8(0xa0,8);
    if (plocal_uvar_2 != (uint64_t *)0x0) {
      *plocal_uvar_2 = 2;
      plocal_uvar_2[4] = local_60;
      plocal_uvar_2[5] = local_58;
      plocal_uvar_2[6] = local_50;
      plocal_uvar_2[7] = local_78;
      plocal_uvar_2[8] = local_70;
      plocal_uvar_2[9] = local_68;
      *(uint32_t *)(plocal_uvar_2 + 0x13) = param_2;
      *(uint8_t *)(plocal_uvar_2 + 10) = 2;
      input[1] = plocal_uvar_2;
      *input = 0;
      return;
    }
  }
  else {
    sub_0x13830(&DAT_ram_0001a8b0,0x37,&local_60,&DAT_ram_0001d8e0,&DAT_ram_0001d900);
  }
                    /* WARNING: Subroutine does not return */
  sub_0x12620(8,0xa0);
}



/* Function: sub_0x0f138 @ 0xf138 */

void sub_0x0f138(uint *input,uint64_t *param_2)

{
  uint local_uvar_1;
  uint8_t *local_30;
  uint64_t local_28;
  uint64_t local_20;
  uint64_t local_18;
  uint64_t local_10;
  
  local_uvar_1 = *input;
  if (local_uvar_1 < 0x7f0) {
    if (local_uvar_1 < 0x7dc) {
      if (local_uvar_1 < 0x7d2) {
        if (local_uvar_1 < 0x3e9) {
          if (local_uvar_1 < 0x66) {
            if (local_uvar_1 == 100) {
              local_30 = &DAT_ram_0001db68;
            }
            else {
              local_30 = &DAT_ram_0001db78;
            }
          }
          else if (local_uvar_1 == 0x66) {
            local_30 = &DAT_ram_0001db88;
          }
          else if (local_uvar_1 == 0x67) {
            local_30 = &DAT_ram_0001db98;
          }
          else {
            local_30 = &DAT_ram_0001dba8;
          }
        }
        else if (local_uvar_1 < 0x5dc) {
          if (local_uvar_1 == 0x3e9) {
            local_30 = &DAT_ram_0001dbb8;
          }
          else {
            local_30 = &DAT_ram_0001dbc8;
          }
        }
        else if (local_uvar_1 == 0x5dc) {
          local_30 = &DAT_ram_0001dbd8;
        }
        else if (local_uvar_1 == 2000) {
          local_30 = &DAT_ram_0001dbe8;
        }
        else {
          local_30 = &DAT_ram_0001dbf8;
        }
      }
      else if (local_uvar_1 < 0x7d7) {
        if (local_uvar_1 < 0x7d4) {
          if (local_uvar_1 == 0x7d2) {
            local_30 = &DAT_ram_0001dc08;
          }
          else {
            local_30 = &DAT_ram_0001dc18;
          }
        }
        else if (local_uvar_1 == 0x7d4) {
          local_30 = &DAT_ram_0001dc28;
        }
        else if (local_uvar_1 == 0x7d5) {
          local_30 = &DAT_ram_0001dc38;
        }
        else {
          local_30 = &DAT_ram_0001dc48;
        }
      }
      else if (local_uvar_1 < 0x7d9) {
        if (local_uvar_1 == 0x7d7) {
          local_30 = &DAT_ram_0001dc58;
        }
        else {
          local_30 = &DAT_ram_0001dc68;
        }
      }
      else if (local_uvar_1 == 0x7d9) {
        local_30 = &DAT_ram_0001dc78;
      }
      else if (local_uvar_1 == 0x7da) {
        local_30 = &DAT_ram_0001dc88;
      }
      else {
        local_30 = &DAT_ram_0001dc98;
      }
    }
    else if (local_uvar_1 < 0x7e6) {
      if (local_uvar_1 < 0x7e1) {
        if (local_uvar_1 < 0x7de) {
          if (local_uvar_1 == 0x7dc) {
            local_30 = &DAT_ram_0001dca8;
          }
          else {
            local_30 = &DAT_ram_0001dcb8;
          }
        }
        else if (local_uvar_1 == 0x7de) {
          local_30 = &DAT_ram_0001dcc8;
        }
        else if (local_uvar_1 == 0x7df) {
          local_30 = &DAT_ram_0001dcd8;
        }
        else {
          local_30 = &DAT_ram_0001dce8;
        }
      }
      else if (local_uvar_1 < 0x7e3) {
        if (local_uvar_1 == 0x7e1) {
          local_30 = &DAT_ram_0001dcf8;
        }
        else {
          local_30 = &DAT_ram_0001dd08;
        }
      }
      else if (local_uvar_1 == 0x7e3) {
        local_30 = &DAT_ram_0001dd18;
      }
      else if (local_uvar_1 == 0x7e4) {
        local_30 = &DAT_ram_0001dd28;
      }
      else {
        local_30 = &DAT_ram_0001dd38;
      }
    }
    else if (local_uvar_1 < 0x7eb) {
      if (local_uvar_1 < 0x7e8) {
        if (local_uvar_1 == 0x7e6) {
          local_30 = &DAT_ram_0001dd48;
        }
        else {
          local_30 = &DAT_ram_0001dd58;
        }
      }
      else if (local_uvar_1 == 0x7e8) {
        local_30 = &DAT_ram_0001dd68;
      }
      else if (local_uvar_1 == 0x7e9) {
        local_30 = &DAT_ram_0001dd78;
      }
      else {
        local_30 = &DAT_ram_0001dd88;
      }
    }
    else if (local_uvar_1 < 0x7ed) {
      if (local_uvar_1 == 0x7eb) {
        local_30 = &DAT_ram_0001dd98;
      }
      else {
        local_30 = &DAT_ram_0001dda8;
      }
    }
    else if (local_uvar_1 == 0x7ed) {
      local_30 = &DAT_ram_0001ddb8;
    }
    else if (local_uvar_1 == 0x7ee) {
      local_30 = &DAT_ram_0001ddc8;
    }
    else {
      local_30 = &DAT_ram_0001ddd8;
    }
  }
  else if (local_uvar_1 < 0xbba) {
    if (local_uvar_1 < 0x7fa) {
      if (local_uvar_1 < 0x7f5) {
        if (local_uvar_1 < 0x7f2) {
          if (local_uvar_1 == 0x7f0) {
            local_30 = &DAT_ram_0001dde8;
          }
          else {
            local_30 = &DAT_ram_0001ddf8;
          }
        }
        else if (local_uvar_1 == 0x7f2) {
          local_30 = &DAT_ram_0001de08;
        }
        else if (local_uvar_1 == 0x7f3) {
          local_30 = &DAT_ram_0001de18;
        }
        else {
          local_30 = &DAT_ram_0001de28;
        }
      }
      else if (local_uvar_1 < 0x7f7) {
        if (local_uvar_1 == 0x7f5) {
          local_30 = &DAT_ram_0001de38;
        }
        else {
          local_30 = &DAT_ram_0001de48;
        }
      }
      else if (local_uvar_1 == 0x7f7) {
        local_30 = &DAT_ram_0001de58;
      }
      else if (local_uvar_1 == 0x7f8) {
        local_30 = &DAT_ram_0001de68;
      }
      else {
        local_30 = &DAT_ram_0001de78;
      }
    }
    else if (local_uvar_1 < 0x9c8) {
      if (local_uvar_1 < 0x9c5) {
        if (local_uvar_1 == 0x7fa) {
          local_30 = &DAT_ram_0001de88;
        }
        else {
          local_30 = &DAT_ram_0001de98;
        }
      }
      else if (local_uvar_1 == 0x9c5) {
        local_30 = &DAT_ram_0001dea8;
      }
      else if (local_uvar_1 == 0x9c6) {
        local_30 = &DAT_ram_0001deb8;
      }
      else {
        local_30 = &DAT_ram_0001dec8;
      }
    }
    else if (local_uvar_1 < 0x9ca) {
      if (local_uvar_1 == 0x9c8) {
        local_30 = &DAT_ram_0001ded8;
      }
      else {
        local_30 = &DAT_ram_0001dee8;
      }
    }
    else if (local_uvar_1 == 0x9ca) {
      local_30 = &DAT_ram_0001def8;
    }
    else if (local_uvar_1 == 3000) {
      local_30 = &DAT_ram_0001df08;
    }
    else {
      local_30 = &DAT_ram_0001df18;
    }
  }
  else if (local_uvar_1 < 0xbc4) {
    if (local_uvar_1 < 0xbbf) {
      if (local_uvar_1 < 0xbbc) {
        if (local_uvar_1 == 0xbba) {
          local_30 = &DAT_ram_0001df28;
        }
        else {
          local_30 = &DAT_ram_0001df38;
        }
      }
      else if (local_uvar_1 == 0xbbc) {
        local_30 = &DAT_ram_0001df48;
      }
      else if (local_uvar_1 == 0xbbd) {
        local_30 = &DAT_ram_0001df58;
      }
      else {
        local_30 = &DAT_ram_0001df68;
      }
    }
    else if (local_uvar_1 < 0xbc1) {
      if (local_uvar_1 == 0xbbf) {
        local_30 = &DAT_ram_0001df78;
      }
      else {
        local_30 = &DAT_ram_0001df88;
      }
    }
    else if (local_uvar_1 == 0xbc1) {
      local_30 = &DAT_ram_0001df98;
    }
    else if (local_uvar_1 == 0xbc2) {
      local_30 = &DAT_ram_0001dfa8;
    }
    else {
      local_30 = &DAT_ram_0001dfb8;
    }
  }
  else if (local_uvar_1 < 0xbc9) {
    if (local_uvar_1 < 0xbc6) {
      if (local_uvar_1 == 0xbc4) {
        local_30 = &DAT_ram_0001dfc8;
      }
      else {
        local_30 = &DAT_ram_0001dfd8;
      }
    }
    else if (local_uvar_1 == 0xbc6) {
      local_30 = &DAT_ram_0001dfe8;
    }
    else if (local_uvar_1 == 0xbc7) {
      local_30 = &DAT_ram_0001dff8;
    }
    else {
      local_30 = &DAT_ram_0001e008;
    }
  }
  else if (local_uvar_1 < 0x1005) {
    if (local_uvar_1 == 0xbc9) {
      local_30 = &DAT_ram_0001e018;
    }
    else {
      local_30 = &DAT_ram_0001e028;
    }
  }
  else if (local_uvar_1 == 0x1005) {
    local_30 = &DAT_ram_0001e038;
  }
  else if (local_uvar_1 == 0x1006) {
    local_30 = &DAT_ram_0001e048;
  }
  else {
    local_30 = &DAT_ram_0001e058;
  }
  local_10 = 0;
  local_28 = 1;
  local_18 = 0;
  local_20 = 8;
  sub_0x0c3f8(*param_2,param_2[1],&local_30);
  return;
}



/* Function: sub_0x0fb90 @ 0xfb90 */

void sub_0x0fb90(uint *input)

{
  int64_t local_var_1;
  uint64_t local_18;
  uint64_t local_10;
  uint8_t local_8;
  uint8_t7 uStack_7;
  
  local_10 = 0x4000000000000000;
  local_8 = 0x32;
  local_18 = 0xd98;
  local_var_1 = sub_0x0fbd0(&local_18);
  if (local_var_1 == 0) {
    *(uint64_t *)(input + 6) = CONCAT71(uStack_7,local_8);
    *(uint64_t *)(input + 4) = local_10;
    *(uint64_t *)(input + 2) = local_18;
  }
  else {
    input[1] = 0x10;
  }
  *input = (uint)(local_var_1 != 0);
  return;
}



/* Function: sub_0x0fbd0 @ 0xfbd0 */

void sub_0x0fbd0(void)

{
  int64_t local_var_1;
  uint *unaff_R6;
  uint64_t local_18;
  uint64_t local_10;
  uint64_t local_8;
  
  local_var_1 = sub_0x0fbd0();
  if (local_var_1 == 0) {
    *(uint64_t *)(unaff_R6 + 6) = local_8;
    *(uint64_t *)(unaff_R6 + 4) = local_10;
    *(uint64_t *)(unaff_R6 + 2) = local_18;
  }
  else {
    unaff_R6[1] = 0x10;
  }
  *unaff_R6 = (uint)(local_var_1 != 0);
  return;
}



/* Function: sub_0x0fc40 @ 0xfc40 */

/* WARNING: Removing unreachable block (ram,0x00010088) */

uint64_t sub_0x0fc40(uint64_t *input,uint64_t param_2)

{
  int64_t local_var_1;
  uint64_t local_uvar_2;
  int64_t local_var_3;
  uint64_t local_uvar_4;
  uint64_t local_uvar_5;
  uint64_t *plocal_uvar_6;
  uint64_t local_uvar_7;
  uint64_t *plocal_uvar_8;
  uint64_t local_10;
  uint64_t local_8;
  
  if (param_2 + 0x80 < param_2) {
                    /* WARNING: Subroutine does not return */
    sub_0x178f0(&DAT_ram_0001e068);
  }
  local_uvar_7 = 0;
  sub_0x19f78(&local_10,param_2 + 0x80,0,*input,0);
  if (local_8 == 0) {
    local_uvar_2 = sub_0x19410(local_10);
    local_uvar_2 = sub_0x19710(input[1],local_uvar_2);
    local_var_3 = sub_0x19610(local_uvar_2,0);
    local_uvar_4 = sub_0x19ec0(local_uvar_2);
    local_uvar_7 = 0;
    if (-1 < local_var_3) {
      local_uvar_7 = local_uvar_4;
    }
    local_var_3 = sub_0x1a0d8(local_uvar_2,0x43efffffffffffff);
    local_uvar_4 = 0xffffffffffffffff;
    if (local_var_3 < 1) {
      local_uvar_4 = local_uvar_7;
    }
    return local_uvar_4;
  }
  plocal_uvar_6 = (uint64_t *)&DAT_ram_0001e080;
  local_uvar_4 = local_8;
  sub_0x17948();
  if (local_uvar_7 + 0x80 < local_uvar_7) {
                    /* WARNING: Subroutine does not return */
    sub_0x178f0(&DAT_ram_0001e068);
  }
  plocal_uvar_8 = (uint64_t *)*plocal_uvar_6;
  local_var_3 = 0;
  sub_0x19f78(&local_10);
  if (local_8 == 0) {
    local_uvar_2 = sub_0x19410(local_10);
    local_uvar_2 = sub_0x19710(plocal_uvar_6[1],local_uvar_2);
    local_var_3 = sub_0x19610(local_uvar_2,0);
    local_uvar_5 = sub_0x19ec0(local_uvar_2);
    local_uvar_7 = 0;
    if (-1 < local_var_3) {
      local_uvar_7 = local_uvar_5;
    }
    local_var_3 = sub_0x1a0d8(local_uvar_2,0x43efffffffffffff);
    local_uvar_5 = 0xffffffffffffffff;
    if (local_var_3 < 1) {
      local_uvar_5 = local_uvar_7;
    }
    return (uint64_t)(local_uvar_5 <= local_uvar_4);
  }
  plocal_uvar_6 = (uint64_t *)&DAT_ram_0001e080;
  local_uvar_7 = local_8;
  sub_0x17948();
  if ((plocal_uvar_8[1] == 0) || (plocal_uvar_8[2] == 0)) {
    if (local_var_3 != 0) {
      sub_0x07428();
      local_uvar_4 = sub_0x041e8(local_var_3,local_uvar_7);
      goto joined_r0x00010070;
    }
    local_var_1 = 0;
    local_uvar_4 = local_uvar_7;
  }
  else {
    local_uvar_4 = sub_0x04300(*plocal_uvar_8,plocal_uvar_8[2],local_uvar_7,local_var_3);
joined_r0x00010070:
    local_var_1 = local_var_3;
    if (local_uvar_4 == 0) {
      local_uvar_4 = 0;
      goto LAB_ram_0000fff0;
    }
  }
  if (local_uvar_4 != 0) {
    local_var_3 = local_var_1;
  }
LAB_ram_0000fff0:
  plocal_uvar_6[2] = local_var_3;
  local_uvar_2 = 1;
  if ((local_uvar_4 != 0) && (local_uvar_2 = 0, local_uvar_4 != 0)) {
    local_uvar_2 = 0;
    local_uvar_7 = local_uvar_4;
  }
  plocal_uvar_6[1] = local_uvar_7;
  *plocal_uvar_6 = local_uvar_2;
  return local_uvar_4;
}



/* Function: sub_0x0fdd0 @ 0xfdd0 */

/* WARNING: Removing unreachable block (ram,0x00010088) */

uint64_t sub_0x0fdd0(uint64_t *input,uint64_t param_2,uint64_t param_3)

{
  int64_t local_var_1;
  uint64_t local_uvar_2;
  uint64_t local_uvar_3;
  uint64_t *plocal_uvar_4;
  uint64_t local_uvar_5;
  int64_t local_var_6;
  uint64_t *plocal_uvar_7;
  uint64_t local_10;
  uint64_t local_8;
  
  if (param_3 + 0x80 < param_3) {
                    /* WARNING: Subroutine does not return */
    sub_0x178f0(&DAT_ram_0001e068);
  }
  plocal_uvar_7 = (uint64_t *)*input;
  local_var_6 = 0;
  sub_0x19f78(&local_10);
  if (local_8 == 0) {
    local_uvar_2 = sub_0x19410(local_10);
    local_uvar_2 = sub_0x19710(input[1],local_uvar_2);
    local_var_6 = sub_0x19610(local_uvar_2,0);
    local_uvar_3 = sub_0x19ec0(local_uvar_2);
    local_uvar_5 = 0;
    if (-1 < local_var_6) {
      local_uvar_5 = local_uvar_3;
    }
    local_var_6 = sub_0x1a0d8(local_uvar_2,0x43efffffffffffff);
    local_uvar_3 = 0xffffffffffffffff;
    if (local_var_6 < 1) {
      local_uvar_3 = local_uvar_5;
    }
    return (uint64_t)(local_uvar_3 <= param_2);
  }
  plocal_uvar_4 = (uint64_t *)&DAT_ram_0001e080;
  local_uvar_5 = local_8;
  sub_0x17948();
  if ((plocal_uvar_7[1] == 0) || (plocal_uvar_7[2] == 0)) {
    if (local_var_6 != 0) {
      sub_0x07428();
      local_uvar_3 = sub_0x041e8(local_var_6,local_uvar_5);
      goto joined_r0x00010070;
    }
    local_var_1 = 0;
    local_uvar_3 = local_uvar_5;
  }
  else {
    local_uvar_3 = sub_0x04300(*plocal_uvar_7,plocal_uvar_7[2],local_uvar_5,local_var_6);
joined_r0x00010070:
    local_var_1 = local_var_6;
    if (local_uvar_3 == 0) {
      local_uvar_3 = 0;
      goto LAB_ram_0000fff0;
    }
  }
  if (local_uvar_3 != 0) {
    local_var_6 = local_var_1;
  }
LAB_ram_0000fff0:
  plocal_uvar_4[2] = local_var_6;
  local_uvar_2 = 1;
  if ((local_uvar_3 != 0) && (local_uvar_2 = 0, local_uvar_3 != 0)) {
    local_uvar_2 = 0;
    local_uvar_5 = local_uvar_3;
  }
  plocal_uvar_4[1] = local_uvar_5;
  *plocal_uvar_4 = local_uvar_2;
  return local_uvar_3;
}



/* Function: sub_0x0ff78 @ 0xff78 */

/* WARNING: Removing unreachable block (ram,0x00010088) */

void sub_0x0ff78(uint64_t *input,int64_t param_2,int64_t param_3,uint64_t *param_4)

{
  int64_t local_var_1;
  int64_t local_var_2;
  uint64_t local_uvar_3;
  
  if ((param_4[1] == 0) || (param_4[2] == 0)) {
    if (param_3 != 0) {
      sub_0x07428();
      local_var_2 = sub_0x041e8(param_3,param_2);
      goto joined_r0x00010070;
    }
    local_var_1 = 0;
    local_var_2 = param_2;
  }
  else {
    local_var_2 = sub_0x04300(*param_4,param_4[2],param_2,param_3);
joined_r0x00010070:
    local_var_1 = param_3;
    if (local_var_2 == 0) {
      local_var_2 = 0;
      goto LAB_ram_0000fff0;
    }
  }
  if (local_var_2 != 0) {
    param_3 = local_var_1;
  }
LAB_ram_0000fff0:
  input[2] = param_3;
  local_uvar_3 = 1;
  if ((local_var_2 != 0) && (local_uvar_3 = 0, local_var_2 != 0)) {
    local_uvar_3 = 0;
    param_2 = local_var_2;
  }
  input[1] = param_2;
  *input = local_uvar_3;
  return;
}



/* Function: sub_0x100b0 @ 0x100b0 */

void sub_0x100b0(uint64_t *input,uint64_t param_2)

{
  uint64_t local_uvar_1;
  uint64_t local_uvar_2;
  uint64_t local_40;
  int64_t local_38;
  int64_t local_30;
  uint64_t local_28;
  uint64_t local_20;
  uint64_t local_18;
  uint64_t local_10;
  int64_t local_8;
  
  local_uvar_1 = *input;
  local_uvar_2 = local_uvar_1 << 1;
  if (local_uvar_2 < 5) {
    local_uvar_2 = 4;
  }
  sub_0x19f78(&local_40,local_uvar_2,0,0x30,0);
  if (local_38 != 0) {
                    /* WARNING: Subroutine does not return */
    sub_0x12600(0,local_38,param_2);
  }
  if (0x7ffffffffffffff8 < local_40) {
                    /* WARNING: Subroutine does not return */
    sub_0x12600(0,0,param_2);
  }
  local_10 = 0;
  if (local_uvar_1 != 0) {
    local_18 = input[1];
    local_8 = local_uvar_1 * 0x30;
    local_10 = 8;
  }
  sub_0x0ff78(&local_30,8,local_40,&local_18);
  if (local_30 == 1) {
                    /* WARNING: Subroutine does not return */
    sub_0x12600(local_28,local_20,param_2);
  }
  *input = local_uvar_2;
  input[1] = local_28;
  return;
}



/* Function: sub_0x10270 @ 0x10270 */

void sub_0x10270(uint64_t *input,uint64_t *param_2)

{
  uint8_t local_uvar_1;
  uint8_t local_uvar_2;
  uint8_t local_uvar_3;
  char cVar4;
  int64_t local_var_5;
  uint64_t local_uvar_6;
  uint64_t local_uvar_7;
  int64_t local_var_8;
  uint64_t local_uvar_9;
  uint64_t local_uvar_10;
  uint64_t local_uvar_11;
  uint64_t *plocal_uvar_12;
  uint64_t local_uvar_13;
  uint64_t local_uvar_14;
  uint64_t local_uvar_15;
  int64_t *plocal_var_16;
  uint64_t local_uvar_17;
  uint64_t local_uvar_18;
  uint64_t local_uvar_19;
  int64_t *plocal_var_20;
  uint64_t local_70;
  uint64_t local_60;
  int64_t local_58;
  uint64_t local_50;
  uint64_t local_48;
  uint64_t local_40;
  uint8_t auStack_38 [51];
  uint32_t local_5;
  uint8_t local_1;
  
  local_uvar_11 = *param_2;
  local_uvar_19 = 0;
  sub_0x19f78(&local_60,local_uvar_11,0,0x30,0);
  if ((local_58 == 0) && (local_60 < 0x7ffffffffffffff9)) {
    if (local_60 == 0) {
      local_70 = 8;
      local_50 = 0;
    }
    else {
      sub_0x07428();
      local_uvar_19 = 8;
      local_70 = sub_0x041e8(local_60,8);
      local_50 = local_uvar_11;
      if (local_70 == 0) goto LAB_ram_00010318;
    }
    local_40 = 0;
    local_uvar_17 = 8;
    local_48 = local_70;
    if (local_uvar_11 != 0) {
      local_var_5 = 0;
      local_uvar_15 = 0;
      do {
        while( true ) {
          local_uvar_13 = local_uvar_17 + 1;
          if (local_uvar_13 == 0) goto LAB_ram_00010d18;
          local_uvar_7 = (uint64_t)*(byte *)((int64_t)param_2 + local_uvar_17);
          if (local_uvar_7 != 0xff) break;
          if (local_uvar_17 + 2 == 0) {
                    /* WARNING: Subroutine does not return */
            sub_0x178f0(&DAT_ram_0001e0c8);
          }
          if (local_uvar_17 == 0xfffffffffffffffd) {
                    /* WARNING: Subroutine does not return */
            sub_0x178f0(&DAT_ram_0001e0e0);
          }
          local_uvar_7 = local_uvar_17 + 4;
          if (local_uvar_7 == 0) {
                    /* WARNING: Subroutine does not return */
            sub_0x178f0(&DAT_ram_0001e0f8);
          }
          local_uvar_18 = local_uvar_17 + 8;
          if (local_uvar_18 < local_uvar_7) {
                    /* WARNING: Subroutine does not return */
            sub_0x178f0(&DAT_ram_0001e110);
          }
          if (local_uvar_17 + 0x28 < local_uvar_18) {
                    /* WARNING: Subroutine does not return */
            sub_0x178f0(&DAT_ram_0001e128);
          }
          if (local_uvar_17 + 0x48 < local_uvar_17 + 0x28) {
                    /* WARNING: Subroutine does not return */
            sub_0x178f0(&DAT_ram_0001e140);
          }
          local_uvar_10 = local_uvar_17 + 0x50;
          if (local_uvar_10 < local_uvar_17 + 0x48) {
                    /* WARNING: Subroutine does not return */
            sub_0x178f0(&DAT_ram_0001e158);
          }
          local_uvar_6 = local_uvar_17 + 0x58;
          if (local_uvar_6 < local_uvar_10) {
LAB_ram_00010d80:
                    /* WARNING: Subroutine does not return */
            sub_0x178f0(&DAT_ram_0001e170);
          }
          cVar4 = *(char *)((int64_t)param_2 + local_uvar_17 + 2);
          local_uvar_17 = *(uint64_t *)((int64_t)param_2 + local_uvar_10);
          *(int *)((int64_t)param_2 + local_uvar_7) = (int)local_uvar_17;
          if ((local_uvar_17 + 0x2800 < local_uvar_17) || (local_uvar_17 + 0x2808 < local_uvar_17 + 0x2800)) {
                    /* WARNING: Subroutine does not return */
            sub_0x178f0(&DAT_ram_0001e188);
          }
          local_uvar_7 = local_uvar_6 + local_uvar_17 + 0x2808;
          if (local_uvar_7 < local_uvar_6) {
                    /* WARNING: Subroutine does not return */
            sub_0x178f0(&DAT_ram_0001e1a0);
          }
          local_uvar_17 = local_uvar_7 + 7 & 0xfffffffffffffff8;
          if (local_uvar_17 < local_uvar_7) {
                    /* WARNING: Subroutine does not return */
            sub_0x178f0(&DAT_ram_0001e1b8);
          }
          local_uvar_19 = 1;
          if (*(char *)((int64_t)param_2 + local_uvar_13) == '\0') {
            local_uvar_19 = 0;
            if (cVar4 == '\0') goto LAB_ram_00010bf8;
LAB_ram_00010a60:
            local_uvar_9 = 1;
          }
          else {
            if (cVar4 != '\0') goto LAB_ram_00010a60;
LAB_ram_00010bf8:
            local_uvar_9 = 0;
          }
          sub_0x11088(auStack_38,(int64_t)param_2 + local_uvar_18,local_uvar_19,local_uvar_9);
          if (local_uvar_15 == local_50) {
            sub_0x100b0(&local_50,&DAT_ram_0001e248);
          }
          local_70 = local_48;
          sub_0x193a8(local_48 + local_var_5,auStack_38,0x30);
          local_40 = local_uvar_15 + 1;
          local_uvar_15 = local_uvar_15 + 1;
          local_var_5 = local_var_5 + 0x30;
          if (local_uvar_11 <= local_uvar_15) goto LAB_ram_00010c18;
        }
        local_uvar_17 = local_uvar_17 + 8;
        if (local_uvar_17 < local_uvar_13) {
                    /* WARNING: Subroutine does not return */
          sub_0x178f0(&DAT_ram_0001e200);
        }
        if (local_uvar_15 <= local_uvar_7) {
          sub_0x13768(local_uvar_7,local_uvar_15,&DAT_ram_0001e218);
          goto LAB_ram_00010d80;
        }
        plocal_uvar_12 = (uint64_t *)(local_70 + local_uvar_7 * 0x30);
        plocal_var_16 = (int64_t *)plocal_uvar_12[1];
        local_var_8 = *plocal_var_16;
        local_uvar_19 = *plocal_uvar_12;
        *plocal_var_16 = local_var_8 + 1;
        if (local_var_8 + 1 == 0) {
code_r0x00010d10:
          sub_0x10d10();
LAB_ram_00010d18:
                    /* WARNING: Subroutine does not return */
          sub_0x178f0(&DAT_ram_0001e1e8);
        }
        plocal_var_20 = (int64_t *)plocal_uvar_12[2];
        local_var_8 = *plocal_var_20;
        *plocal_var_20 = local_var_8 + 1;
        if (local_var_8 + 1 == 0) goto code_r0x00010d10;
        local_uvar_1 = *(uint8_t *)((int64_t)plocal_uvar_12 + 0x2a);
        local_uvar_2 = *(uint8_t *)((int64_t)plocal_uvar_12 + 0x29);
        local_uvar_3 = *(uint8_t *)(plocal_uvar_12 + 5);
        local_uvar_14 = plocal_uvar_12[4];
        local_uvar_9 = plocal_uvar_12[3];
        if (local_uvar_15 == local_50) {
          sub_0x100b0(&local_50,&DAT_ram_0001e230);
          local_70 = local_48;
        }
        plocal_uvar_12 = (uint64_t *)(local_70 + local_var_5);
        *(uint8_t *)((int64_t)plocal_uvar_12 + 0x2a) = local_uvar_1;
        *(uint8_t *)((int64_t)plocal_uvar_12 + 0x29) = local_uvar_2;
        *(uint8_t *)(plocal_uvar_12 + 5) = local_uvar_3;
        plocal_uvar_12[4] = local_uvar_14;
        plocal_uvar_12[3] = local_uvar_9;
        plocal_uvar_12[2] = plocal_var_20;
        plocal_uvar_12[1] = plocal_var_16;
        *plocal_uvar_12 = local_uvar_19;
        *(uint32_t *)((int64_t)plocal_uvar_12 + 0x2b) = local_5;
        *(uint8_t *)((int64_t)plocal_uvar_12 + 0x2f) = local_1;
        local_40 = local_uvar_15 + 1;
        local_uvar_15 = local_uvar_15 + 1;
        local_var_5 = local_var_5 + 0x30;
      } while (local_uvar_15 < local_uvar_11);
    }
LAB_ram_00010c18:
    local_uvar_11 = local_uvar_17 + 8;
    if (local_uvar_11 < local_uvar_17) {
                    /* WARNING: Subroutine does not return */
      sub_0x178f0(&DAT_ram_0001e098);
    }
    local_uvar_15 = *(uint64_t *)((int64_t)param_2 + local_uvar_17);
    local_uvar_17 = local_uvar_11 + local_uvar_15;
    if (local_uvar_11 <= local_uvar_17) {
      input[2] = local_40;
      input[1] = local_48;
      *input = local_50;
      input[5] = local_uvar_15;
      input[4] = (int64_t)param_2 + local_uvar_11;
      input[3] = (int64_t)param_2 + local_uvar_17;
      return;
    }
                    /* WARNING: Subroutine does not return */
    sub_0x178f0(&DAT_ram_0001e0b0);
  }
LAB_ram_00010318:
                    /* WARNING: Subroutine does not return */
  sub_0x12600(local_uvar_19,local_60,&DAT_ram_0001e1d0);
}



/* Function: sub_0x10d10 @ 0x10d10 */

void sub_0x10d10(void)

{
  sub_0x10d10();
                    /* WARNING: Subroutine does not return */
  sub_0x178f0(&DAT_ram_0001e1e8);
}



/* Function: sub_0x10ea0 @ 0x10ea0 */

void sub_0x10ea0(int64_t *input)

{
  int64_t local_var_1;
  int64_t local_var_2;
  
  local_var_1 = *input;
  if ((local_var_1 != -1) &&
     (local_var_2 = *(int64_t *)(local_var_1 + 8) + -1, *(int64_t *)(local_var_1 + 8) = local_var_2, local_var_2 == 0)) {
    sub_0x042f8(local_var_1,0x20,8);
  }
  return;
}



/* Function: sub_0x10ef0 @ 0x10ef0 */

void sub_0x10ef0(int64_t *input)

{
  int64_t local_var_1;
  int64_t local_var_2;
  
  local_var_1 = *input;
  if ((local_var_1 != -1) &&
     (local_var_2 = *(int64_t *)(local_var_1 + 8) + -1, *(int64_t *)(local_var_1 + 8) = local_var_2, local_var_2 == 0)) {
    sub_0x042f8(local_var_1,0x28,8);
  }
  return;
}



/* Function: sub_0x10f40 @ 0x10f40 */

uint64_t sub_0x10f40(int64_t input)

{
  bool is_valid_1;
  uint64_t local_uvar_2;
  int64_t local_var_3;
  uint *plocal_uvar_4;
  uint64_t local_uvar_5;
  
  local_var_3 = *(int64_t *)(&((AccountContext *)input)->ref_count);
  local_uvar_5 = *(uint64_t *)(local_var_3 + 0x10);
  if (local_uvar_5 < 0x7fffffffffffffff) {
    *(uint64_t *)(local_var_3 + 0x10) = local_uvar_5 + 1;
    local_uvar_2 = **(uint64_t **)(local_var_3 + 0x18);
    *(uint64_t *)(local_var_3 + 0x10) = local_uvar_5;
    return local_uvar_2;
  }
  plocal_uvar_4 = (uint *)&DAT_ram_0001e260;
  local_uvar_2 = sub_0x12cf8();
  is_valid_1 = 0x7ffffffffffffffe < *(uint64_t *)(*(int64_t *)(local_uvar_5 + 0x10) + 0x10);
  if (is_valid_1) {
    plocal_uvar_4[1] = 0xb;
    plocal_uvar_4[2] = 0;
  }
  else {
    *(uint64_t *)(plocal_uvar_4 + 2) = *(uint64_t *)(*(int64_t *)(local_uvar_5 + 0x10) + 0x20);
  }
  *plocal_uvar_4 = (uint)is_valid_1;
  return local_uvar_2;
}



/* Function: sub_0x10fb8 @ 0x10fb8 */

void sub_0x10fb8(uint *input,int64_t param_2)

{
  bool is_valid_1;
  
  is_valid_1 = 0x7ffffffffffffffe < *(uint64_t *)(*(int64_t *)(param_2 + 0x10) + 0x10);
  if (is_valid_1) {
    input[1] = 0xb;
    input[2] = 0;
  }
  else {
    *(uint64_t *)(input + 2) = *(uint64_t *)(*(int64_t *)(param_2 + 0x10) + 0x20);
  }
  *input = (uint)is_valid_1;
  return;
}



/* Function: sub_0x11020 @ 0x11020 */

uint64_t *
sub_0x11020(int64_t input,uint64_t param_2,uint64_t param_3,uint8_t param_4,
                int64_t param_5)

{
  uint64_t *plocal_uvar_1;
  uint64_t *plocal_uvar_2;
  uint64_t *plocal_uvar_3;
  uint64_t local_uvar_4;
  uint64_t local_uvar_5;
  uint64_t local_uvar_6;
  uint64_t local_uvar_7;
  uint8_t local_uvar_8;
  uint64_t local_uvar_9;
  
  local_uvar_7 = *(uint64_t *)(*(int64_t *)(input + 0x10) + 0x10);
  local_uvar_8 = 0xff;
  if (local_uvar_7 < 0x7fffffffffffffff) {
    return (uint64_t *)(uint64_t)(*(int64_t *)(*(int64_t *)(input + 0x10) + 0x20) == 0);
  }
  plocal_uvar_3 = (uint64_t *)&DAT_ram_0001e278;
  sub_0x12cf8();
  sub_0x07428();
  plocal_uvar_1 = (uint64_t *)sub_0x041e8(0x20,8);
  if (plocal_uvar_1 != (uint64_t *)0x0) {
    local_uvar_4 = *(uint64_t *)(param_5 + -0xfe0);
    local_uvar_5 = *(uint64_t *)(param_5 + -0xfe8);
    local_uvar_6 = *(uint64_t *)(param_5 + -0xff0);
    local_uvar_9 = *(uint64_t *)(param_5 + -0xff8);
    plocal_uvar_1[3] = *(uint64_t *)(param_5 + -0x1000);
    plocal_uvar_1[2] = 0;
    plocal_uvar_1[1] = 1;
    *plocal_uvar_1 = 1;
    sub_0x07428();
    plocal_uvar_2 = (uint64_t *)sub_0x041e8(0x28,8);
    if (plocal_uvar_2 != (uint64_t *)0x0) {
      plocal_uvar_2[4] = local_uvar_6;
      plocal_uvar_2[3] = local_uvar_9;
      plocal_uvar_2[2] = 0;
      plocal_uvar_2[1] = 1;
      *plocal_uvar_2 = 1;
      *(char *)((int64_t)plocal_uvar_3 + 0x2a) = (char)local_uvar_4;
      *(uint8_t *)((int64_t)plocal_uvar_3 + 0x29) = param_4;
      *(uint8_t *)(plocal_uvar_3 + 5) = local_uvar_8;
      plocal_uvar_3[3] = local_uvar_5;
      plocal_uvar_3[2] = (uint64_t)plocal_uvar_2;
      plocal_uvar_3[1] = (uint64_t)plocal_uvar_1;
      *plocal_uvar_3 = local_uvar_7;
      plocal_uvar_3[4] = 0;
      return plocal_uvar_2;
    }
                    /* WARNING: Subroutine does not return */
    sub_0x12620(8,0x28);
  }
                    /* WARNING: Subroutine does not return */
  sub_0x12620(8,0x20);
}



/* Function: sub_0x11088 @ 0x11088 */

void sub_0x11088(uint64_t *input,uint64_t param_2,uint8_t param_3,uint8_t param_4,
                     int64_t param_5)

{
  uint64_t *plocal_uvar_1;
  uint64_t *plocal_uvar_2;
  uint64_t local_uvar_3;
  uint64_t local_uvar_4;
  uint64_t local_uvar_5;
  uint64_t local_uvar_6;
  
  sub_0x07428();
  plocal_uvar_1 = (uint64_t *)sub_0x041e8(0x20,8);
  if (plocal_uvar_1 == (uint64_t *)0x0) {
                    /* WARNING: Subroutine does not return */
    sub_0x12620(8,0x20);
  }
  local_uvar_3 = *(uint64_t *)(param_5 + -0xfe0);
  local_uvar_4 = *(uint64_t *)(param_5 + -0xfe8);
  local_uvar_5 = *(uint64_t *)(param_5 + -0xff0);
  local_uvar_6 = *(uint64_t *)(param_5 + -0xff8);
  plocal_uvar_1[3] = *(uint64_t *)(param_5 + -0x1000);
  plocal_uvar_1[2] = 0;
  plocal_uvar_1[1] = 1;
  *plocal_uvar_1 = 1;
  sub_0x07428();
  plocal_uvar_2 = (uint64_t *)sub_0x041e8(0x28,8);
  if (plocal_uvar_2 != (uint64_t *)0x0) {
    plocal_uvar_2[4] = local_uvar_5;
    plocal_uvar_2[3] = local_uvar_6;
    plocal_uvar_2[2] = 0;
    plocal_uvar_2[1] = 1;
    *plocal_uvar_2 = 1;
    *(char *)((int64_t)input + 0x2a) = (char)local_uvar_3;
    *(uint8_t *)((int64_t)input + 0x29) = param_4;
    *(uint8_t *)(input + 5) = param_3;
    input[3] = local_uvar_4;
    input[2] = plocal_uvar_2;
    input[1] = plocal_uvar_1;
    *input = param_2;
    input[4] = 0;
    return;
  }
                    /* WARNING: Subroutine does not return */
  sub_0x12620(8,0x28);
}



/* Function: sub_0x11758 @ 0x11758 */

uint64_t sub_0x11758(uint64_t input)

{
  char cVar1;
  uint64_t local_uvar_2;
  uint64_t local_uvar_3;
  uint64_t local_uvar_4;
  uint64_t *plocal_uvar_5;
  
  local_uvar_3 = input & 3;
  if (local_uvar_3 < 2) {
    if (local_uvar_3 == 0) {
      cVar1 = *(char *)(input + 0x10);
    }
    else {
      cVar1 = *(char *)(input + 0xf);
    }
    if (cVar1 != '%') {
      return input;
    }
  }
  else {
    if (local_uvar_3 == 2) {
      return input;
    }
    local_uvar_2 = input >> 0x20;
    if (0x29 < local_uvar_2) {
      local_uvar_2 = 0x2a;
    }
    if ((local_uvar_2 & 0xff) != 0x25) {
      return input;
    }
  }
  local_uvar_2 = sub_0x11a98(0x15,&DAT_ram_0001c6d1,0x1a);
  if ((1 < local_uvar_3 - 2) && (local_uvar_3 != 0)) {
    local_uvar_4 = *(uint64_t *)(input - 1);
    plocal_uvar_5 = *(uint64_t **)(input + 7);
    if ((code *)*plocal_uvar_5 != (code *)0x0) {
      (*(code *)*plocal_uvar_5)(local_uvar_4);
    }
    if (plocal_uvar_5[1] != 0) {
      sub_0x042f8(local_uvar_4,plocal_uvar_5[1],plocal_uvar_5[2]);
    }
    sub_0x042f8(input - 1,0x18,8);
  }
  return local_uvar_2;
}



/* Function: sub_0x11a98 @ 0x11a98 */

int64_t sub_0x11a98(uint8_t input,uint64_t param_2,int64_t param_3)

{
  int64_t local_var_1;
  int64_t *plocal_var_2;
  int64_t *plocal_var_3;
  uint64_t local_uvar_4;
  
  local_uvar_4 = 0;
  if (-1 < param_3) {
    if (param_3 == 0) {
      local_var_1 = 1;
    }
    else {
      sub_0x07428(0);
      local_var_1 = sub_0x041e8(param_3,1);
      local_uvar_4 = 1;
      if (local_var_1 == 0) goto LAB_ram_00011ab8;
    }
    sub_0x193a8(local_var_1,param_2,param_3);
    sub_0x07428();
    plocal_var_2 = (int64_t *)sub_0x041e8(0x18,8);
    if (plocal_var_2 != (int64_t *)0x0) {
      plocal_var_2[1] = local_var_1;
      plocal_var_2[2] = param_3;
      *plocal_var_2 = param_3;
      sub_0x07428();
      plocal_var_3 = (int64_t *)sub_0x041e8(0x18,8);
      if (plocal_var_3 != (int64_t *)0x0) {
        *(uint8_t *)(plocal_var_3 + 2) = input;
        plocal_var_3[1] = (int64_t)&DAT_ram_0001e2c0;
        *plocal_var_3 = (int64_t)plocal_var_2;
        return (int64_t)plocal_var_3 + 1;
      }
    }
                    /* WARNING: Subroutine does not return */
    sub_0x12620(8,0x18);
  }
LAB_ram_00011ab8:
                    /* WARNING: Subroutine does not return */
  sub_0x12600(local_uvar_4,param_3,&DAT_ram_0001e318);
}



/* Function: sub_0x120b0 @ 0x120b0 */

void sub_0x120b0(byte *input,uint64_t param_2)

{
  sub_0x12150();
  sub_0x12140();
  sub_0x15688(param_2,*(uint64_t *)(&DAT_ram_0001e3d0 + (uint64_t)*input * 8),
                   *(uint64_t *)(&DAT_ram_0001c918 + (uint64_t)*input * 8));
  return;
}



/* Function: sub_0x120b8 @ 0x120b8 */

void sub_0x120b8(byte *input,uint64_t param_2)

{
  sub_0x12140();
  sub_0x15688(param_2,*(uint64_t *)(&DAT_ram_0001e3d0 + (uint64_t)*input * 8),
                   *(uint64_t *)(&DAT_ram_0001c918 + (uint64_t)*input * 8));
  return;
}



/* Function: sub_0x12130 @ 0x12130 */

void sub_0x12130(void)

{
  sub_0x12130();
  return;
}



/* Function: sub_0x12140 @ 0x12140 */

void sub_0x12140(void)

{
  uint64_t *plocal_uvar_1;
  int64_t local_var_2;
  uint8_t *puStack_30;
  uint64_t uStack_28;
  uint64_t uStack_20;
  uint64_t uStack_18;
  uint64_t uStack_10;
  
  sub_0x12140();
  sub_0x12148();
  sub_0x12150();
  plocal_uvar_1 = (uint64_t *)&DAT_ram_0001c8ea;
  local_var_2 = 0x2e;
  sub_0x12130();
  sub_0x120b0();
  sub_0x12158();
  if (local_var_2 == 0) {
    *plocal_uvar_1 = 0;
    return;
  }
  puStack_30 = &DAT_ram_0001e520;
  uStack_10 = 0;
  uStack_28 = 1;
  uStack_18 = 0;
  uStack_20 = 8;
                    /* WARNING: Subroutine does not return */
  sub_0x136d0(&puStack_30,&DAT_ram_0001e530);
}



/* Function: sub_0x12148 @ 0x12148 */

void sub_0x12148(void)

{
  uint64_t *plocal_uvar_1;
  int64_t local_var_2;
  uint8_t *puStack_30;
  uint64_t uStack_28;
  uint64_t uStack_20;
  uint64_t uStack_18;
  uint64_t uStack_10;
  
  sub_0x12148();
  sub_0x12150();
  plocal_uvar_1 = (uint64_t *)&DAT_ram_0001c8ea;
  local_var_2 = 0x2e;
  sub_0x12130();
  sub_0x120b0();
  sub_0x12158();
  if (local_var_2 == 0) {
    *plocal_uvar_1 = 0;
    return;
  }
  puStack_30 = &DAT_ram_0001e520;
  uStack_10 = 0;
  uStack_28 = 1;
  uStack_18 = 0;
  uStack_20 = 8;
                    /* WARNING: Subroutine does not return */
  sub_0x136d0(&puStack_30,&DAT_ram_0001e530);
}



/* Function: sub_0x12150 @ 0x12150 */

void sub_0x12150(void)

{
  uint64_t *plocal_uvar_1;
  int64_t local_var_2;
  uint8_t *puStack_30;
  uint64_t uStack_28;
  uint64_t uStack_20;
  uint64_t uStack_18;
  uint64_t uStack_10;
  
  sub_0x12150();
  plocal_uvar_1 = (uint64_t *)&DAT_ram_0001c8ea;
  local_var_2 = 0x2e;
  sub_0x12130();
  sub_0x120b0();
  sub_0x12158();
  if (local_var_2 == 0) {
    *plocal_uvar_1 = 0;
    return;
  }
  puStack_30 = &DAT_ram_0001e520;
  uStack_10 = 0;
  uStack_28 = 1;
  uStack_18 = 0;
  uStack_20 = 8;
                    /* WARNING: Subroutine does not return */
  sub_0x136d0(&puStack_30,&DAT_ram_0001e530);
}



/* Function: sub_0x12158 @ 0x12158 */

void sub_0x12158(void)

{
  uint64_t *plocal_uvar_1;
  int64_t local_var_2;
  uint8_t *puStack_30;
  uint64_t uStack_28;
  uint64_t uStack_20;
  uint64_t uStack_18;
  uint64_t uStack_10;
  
  plocal_uvar_1 = (uint64_t *)&DAT_ram_0001c8ea;
  local_var_2 = 0x2e;
  sub_0x12130();
  sub_0x120b0();
  sub_0x12158();
  if (local_var_2 == 0) {
    *plocal_uvar_1 = 0;
    return;
  }
  puStack_30 = &DAT_ram_0001e520;
  uStack_10 = 0;
  uStack_28 = 1;
  uStack_18 = 0;
  uStack_20 = 8;
                    /* WARNING: Subroutine does not return */
  sub_0x136d0(&puStack_30,&DAT_ram_0001e530);
}



/* Function: sub_0x12180 @ 0x12180 */

void sub_0x12180(uint64_t *input,int64_t param_2)

{
  uint8_t *puStack_30;
  uint64_t uStack_28;
  uint64_t uStack_20;
  uint64_t uStack_18;
  uint64_t uStack_10;
  
  sub_0x12158();
  if (param_2 == 0) {
    *input = 0;
    return;
  }
  puStack_30 = &DAT_ram_0001e520;
  uStack_10 = 0;
  uStack_28 = 1;
  uStack_18 = 0;
  uStack_20 = 8;
                    /* WARNING: Subroutine does not return */
  sub_0x136d0(&puStack_30,&DAT_ram_0001e530);
}



/* Function: sub_0x12188 @ 0x12188 */

void sub_0x12188(uint64_t *input,int64_t param_2)

{
  uint8_t *local_30;
  uint64_t local_28;
  uint64_t local_20;
  uint64_t local_18;
  uint64_t local_10;
  
  if (param_2 == 0) {
    *input = 0;
    return;
  }
  local_30 = &DAT_ram_0001e520;
  local_10 = 0;
  local_28 = 1;
  local_18 = 0;
  local_20 = 8;
                    /* WARNING: Subroutine does not return */
  sub_0x136d0(&local_30,&DAT_ram_0001e530);
}



/* Function: sub_0x12200 @ 0x12200 */

void sub_0x12200(uint64_t *input,int64_t param_2,uint64_t param_3,uint64_t param_4)

{
  if (param_2 == 0) {
    input[1] = param_4;
    *input = param_3;
    return;
  }
                    /* WARNING: Subroutine does not return */
  sub_0x12620(param_3,param_4);
}



/* Function: sub_0x122c0 @ 0x122c0 */

void sub_0x122c0(uint64_t input)

{
  uint8_t *local_30;
  uint64_t local_28;
  uint64_t local_20;
  uint64_t local_18;
  uint64_t local_10;
  
  local_30 = &DAT_ram_0001e578;
  local_10 = 0;
  local_28 = 1;
  local_18 = 0;
  local_20 = 8;
                    /* WARNING: Subroutine does not return */
  sub_0x136d0(&local_30,input);
}



/* Function: sub_0x12600 @ 0x12600 */

void sub_0x12600(int64_t input,uint64_t param_2,uint64_t param_3)

{
  if (input == 0) {
    sub_0x122c0(param_3);
  }
                    /* WARNING: Subroutine does not return */
  sub_0x12620();
}



/* Function: sub_0x12620 @ 0x12620 */

void sub_0x12620(int64_t input,uint64_t *param_2)

{
  sub_0x07418();
  param_2[1] = *(uint64_t *)(input + 0x10);
  *param_2 = *(uint64_t *)(&((AccountContext *)input)->ref_count);
  return;
}



/* Function: sub_0x126b8 @ 0x126b8 */

void sub_0x126b8(uint64_t *input,int64_t *param_2)

{
  int64_t *plocal_var_1;
  uint64_t local_uvar_2;
  int64_t local_var_3;
  uint64_t local_uvar_4;
  uint64_t local_uvar_5;
  uint64_t local_20;
  uint64_t local_18;
  uint64_t local_10;
  
  local_var_3 = param_2[1];
  if (local_var_3 == 0) {
    local_uvar_4 = 0;
    local_var_3 = param_2[3];
joined_r0x00012800:
    if (local_var_3 == 0) goto LAB_ram_00012758;
  }
  else {
    local_uvar_4 = 0;
    plocal_var_1 = (int64_t *)(*param_2 + 8);
    do {
      local_uvar_4 = *plocal_var_1 + local_uvar_4;
      plocal_var_1 = plocal_var_1 + 2;
      local_var_3 = local_var_3 + -1;
    } while (local_var_3 != 0);
    if (param_2[3] == 0) goto LAB_ram_00012820;
    if (local_uvar_4 < 0x10) {
      local_var_3 = *(int64_t *)(*param_2 + 8);
      goto joined_r0x00012800;
    }
  }
  if ((int64_t)local_uvar_4 < 1) {
    local_uvar_4 = 0;
  }
  local_uvar_4 = local_uvar_4 << 1;
LAB_ram_00012820:
  local_uvar_5 = 0;
  if (-1 < (int64_t)local_uvar_4) {
    do {
      if (local_uvar_4 == 0) {
LAB_ram_00012758:
        local_uvar_2 = 1;
        local_uvar_4 = 0;
      }
      else {
        sub_0x07428();
        local_uvar_5 = 1;
        local_uvar_2 = sub_0x041e8(local_uvar_4,1);
        if (local_uvar_2 == 0) break;
      }
      local_10 = 0;
      local_20 = local_uvar_4;
      local_18 = local_uvar_2;
      local_var_3 = sub_0x146f8(&local_20,&DAT_ram_0001e548,param_2);
      if (local_var_3 == 0) {
        input[2] = local_10;
        input[1] = local_18;
        *input = local_20;
        return;
      }
      param_2 = (int64_t *)&stack0xffffffffffffffff;
      input = (uint64_t *)0x1ca9a;
      local_uvar_4 = 0x56;
      sub_0x13830();
    } while( true );
  }
                    /* WARNING: Subroutine does not return */
  sub_0x12600(local_uvar_5,local_uvar_4,&DAT_ram_0001e5a0);
}



/* Function: sub_0x12cf8 @ 0x12cf8 */

void sub_0x12cf8(uint64_t input)

{
  uint8_t *local_48;
  uint64_t local_40;
  uint8_t **local_38;
  uint64_t local_30;
  uint64_t local_28;
  uint8_t *local_18;
  uint8_t *local_10;
  uint8_t uStack_1;
  
  local_48 = &DAT_ram_0001ab30;
  local_38 = &local_18;
  local_10 = &LAB_ram_00012cc8;
  local_18 = &uStack_1;
  local_28 = 0;
  local_40 = 1;
  local_30 = 1;
                    /* WARNING: Subroutine does not return */
  sub_0x136d0(&local_48,input);
}



/* Function: sub_0x136d0 @ 0x136d0 */

void sub_0x136d0(uint64_t input,uint64_t *param_2,uint64_t param_3)

{
  uint64_t *plocal_uvar_1;
  uint64_t **local_40;
  uint64_t local_38;
  uint64_t local_30;
  uint64_t local_28;
  uint64_t local_20;
  uint64_t local_18;
  uint64_t *local_10;
  uint64_t *local_8;
  
  local_8 = (uint64_t *)CONCAT62(local_8._2_6_,1);
  plocal_uvar_1 = &local_18;
  local_18 = input;
  local_10 = param_2;
  sub_0x120b8();
  local_40 = &local_10;
  local_20 = 0;
  local_38 = 1;
  local_28 = 0;
  local_30 = 8;
  local_10 = plocal_uvar_1;
  local_8 = param_2;
                    /* WARNING: Subroutine does not return */
  sub_0x136d0(&local_40,param_3);
}



/* Function: sub_0x13768 @ 0x13768 */

void sub_0x13768(uint64_t input,uint64_t param_2,uint64_t param_3)

{
  uint64_t local_60;
  uint64_t local_58;
  uint8_t *local_50;
  uint64_t local_48;
  uint64_t **local_40;
  uint64_t local_38;
  uint64_t local_30;
  uint64_t *local_20;
  uint8_t *local_18;
  uint64_t *local_10;
  uint8_t *local_8;
  
  local_50 = &DAT_ram_0001e610;
  local_40 = &local_20;
  local_10 = &local_60;
  local_8 = &LAB_ram_00018960;
  local_18 = &LAB_ram_00018960;
  local_20 = &local_58;
  local_30 = 0;
  local_48 = 2;
  local_38 = 2;
  local_60 = input;
  local_58 = param_2;
                    /* WARNING: Subroutine does not return */
  sub_0x136d0(&local_50,param_3);
}



/* Function: sub_0x13830 @ 0x13830 */

void sub_0x13830(uint64_t input,uint64_t param_2,uint64_t param_3,uint64_t param_4,
                     uint64_t param_5)

{
  uint64_t local_70;
  uint64_t local_68;
  uint64_t local_60;
  uint64_t local_58;
  uint8_t *local_50;
  uint64_t local_48;
  uint64_t **local_40;
  uint64_t local_38;
  uint64_t local_30;
  uint64_t *local_20;
  uint8_t *local_18;
  uint64_t *local_10;
  uint8_t *local_8;
  
  local_50 = &DAT_ram_0001e630;
  local_40 = &local_20;
  local_8 = &LAB_ram_00018ca8;
  local_10 = &local_60;
  local_18 = &LAB_ram_00018cd8;
  local_20 = &local_70;
  local_30 = 0;
  local_48 = 2;
  local_38 = 2;
  local_70 = input;
  local_68 = param_2;
  local_60 = param_3;
  local_58 = param_4;
                    /* WARNING: Subroutine does not return */
  sub_0x136d0(&local_50,param_5);
}



/* Function: sub_0x146f8 @ 0x146f8 */

uint64_t sub_0x146f8(uint64_t input,int64_t param_2,int64_t *param_3)

{
  int64_t local_var_1;
  uint16_t local_uvar_2;
  int64_t local_var_3;
  uint64_t *plocal_uvar_4;
  short sVar5;
  uint16_t local_uvar_6;
  code *pcVar7;
  int64_t *plocal_var_8;
  uint64_t local_uvar_9;
  int64_t *plocal_var_10;
  uint64_t *plocal_uvar_11;
  int64_t local_var_12;
  uint64_t local_18;
  int64_t local_10;
  uint64_t local_8;
  
  local_8 = 0xe0000020;
  local_18 = input;
  local_10 = param_2;
  if (param_3[4] == 0) {
    if (param_3[3] != 0) {
      plocal_uvar_4 = (uint64_t *)param_3[2];
      plocal_uvar_11 = plocal_uvar_4 + param_3[3] * 2;
      local_uvar_9 = 0;
      plocal_var_8 = (int64_t *)(*param_3 + 8);
      do {
        if ((*plocal_var_8 != 0) &&
           (local_var_3 = (**(code **)(local_10 + 0x18))
                              (local_18,plocal_var_8[-1],*plocal_var_8,*(code **)(local_10 + 0x18)), local_var_3 != 0)
           ) {
          return 1;
        }
        local_var_3 = (*(code *)plocal_uvar_4[1])(*plocal_uvar_4,&local_18,(code *)plocal_uvar_4[1]);
        if (local_var_3 != 0) {
          return 1;
        }
        local_uvar_9 = local_uvar_9 + 1;
        plocal_var_8 = plocal_var_8 + 2;
        plocal_uvar_4 = plocal_uvar_4 + 2;
      } while (plocal_uvar_4 != plocal_uvar_11);
      goto LAB_ram_000149f8;
    }
    local_var_3 = param_3[1];
  }
  else {
    if (param_3[5] != 0) {
      local_uvar_9 = 0;
      plocal_var_10 = (int64_t *)(param_3[4] + 0x18);
      local_var_12 = param_3[5] * 0x30;
      local_var_3 = param_3[2];
      plocal_var_8 = (int64_t *)(*param_3 + 8);
      do {
        if ((*plocal_var_8 != 0) &&
           (local_var_1 = (**(code **)(local_10 + 0x18))
                              (local_18,plocal_var_8[-1],*plocal_var_8,*(code **)(local_10 + 0x18)), local_var_1 != 0)
           ) {
          return 1;
        }
        if ((short)plocal_var_10[-1] == 0) {
          local_uvar_2 = *(uint16_t *)((int64_t)plocal_var_10 + -6);
          sVar5 = (short)plocal_var_10[-3];
          if (sVar5 == 2) goto LAB_ram_00014868;
LAB_ram_00014818:
          if (sVar5 == 1) {
            local_uvar_6 = *(uint16_t *)(local_var_3 + plocal_var_10[-2] * 0x10 + 8);
          }
          else {
            local_uvar_6 = *(uint16_t *)((int64_t)plocal_var_10 + -0x16);
          }
        }
        else {
          local_uvar_2 = 0;
          if ((short)plocal_var_10[-1] == 1) {
            local_uvar_2 = *(uint16_t *)(local_var_3 + *plocal_var_10 * 0x10 + 8);
          }
          sVar5 = (short)plocal_var_10[-3];
          if (sVar5 != 2) goto LAB_ram_00014818;
LAB_ram_00014868:
          local_uvar_6 = 0;
        }
        local_8 = CONCAT44(CONCAT22(local_uvar_6,local_uvar_2),(int)plocal_var_10[2]);
        plocal_uvar_4 = (uint64_t *)(local_var_3 + plocal_var_10[1] * 0x10);
        pcVar7 = (code *)plocal_uvar_4[1];
        local_var_1 = (*pcVar7)(*plocal_uvar_4,&local_18,pcVar7);
        if (local_var_1 != 0) {
          return 1;
        }
        local_uvar_9 = local_uvar_9 + 1;
        plocal_var_10 = plocal_var_10 + 6;
        plocal_var_8 = plocal_var_8 + 2;
        local_var_12 = local_var_12 + -0x30;
      } while (local_var_12 != 0);
LAB_ram_000149f8:
      if ((uint64_t)param_3[1] <= local_uvar_9) {
        return 0;
      }
      goto LAB_ram_00014a70;
    }
    local_var_3 = param_3[1];
  }
  local_uvar_9 = 0;
  if (local_var_3 == 0) {
    return 0;
  }
LAB_ram_00014a70:
  plocal_uvar_4 = (uint64_t *)(*param_3 + local_uvar_9 * 0x10);
  local_var_3 = (**(code **)(local_10 + 0x18))(local_18,*plocal_uvar_4,plocal_uvar_4[1],*(code **)(local_10 + 0x18));
  if (local_var_3 == 0) {
    return 0;
  }
  return 1;
}



/* Function: sub_0x14ae0 @ 0x14ae0 */

byte sub_0x14ae0(uint64_t *input,int64_t param_2,char *param_3,uint64_t param_4,
                     int64_t param_5)

{
  byte is_valid_1;
  int64_t local_var_2;
  uint64_t local_uvar_3;
  char *pcVar4;
  uint64_t local_uvar_5;
  uint64_t local_uvar_6;
  uint64_t local_uvar_7;
  uint64_t local_uvar_8;
  code *pcVar9;
  uint64_t local_uvar_10;
  uint64_t local_uvar_11;
  uint64_t local_uvar_12;
  int64_t local_var_13;
  uint64_t local_uvar_14;
  char *local_10;
  
  local_uvar_10 = *(uint64_t *)(param_5 + -0xff8);
  if (param_2 == 0) {
    local_uvar_6 = 0x2d;
    local_uvar_12 = (uint64_t)*(uint *)(input + 2);
LAB_ram_00014b50:
    local_uvar_5 = local_uvar_10 + 1;
  }
  else {
    local_uvar_6 = 0x110000;
    local_uvar_12 = (uint64_t)*(uint *)(input + 2);
    local_uvar_5 = local_uvar_10;
    if ((*(uint *)(input + 2) & 0x200000) != 0) {
      local_uvar_6 = 0x2b;
      goto LAB_ram_00014b50;
    }
  }
  local_uvar_3 = *(uint64_t *)(param_5 + -0x1000);
  if ((local_uvar_12 & 0x800000) == 0) {
    local_10 = (char *)0x0;
    local_uvar_7 = (uint64_t)*(ushort *)((int64_t)input + 0x14);
    if (local_uvar_5 < local_uvar_7) {
LAB_ram_00014d28:
      if ((local_uvar_12 & 0x1000000) == 0) {
        local_uvar_7 = local_uvar_7 - local_uvar_5;
        local_uvar_5 = local_uvar_12 >> 0x1d & 3;
        if (local_uvar_5 < 2) {
          local_uvar_14 = 0;
          if (local_uvar_5 != 0) {
            local_uvar_14 = local_uvar_7;
          }
        }
        else {
          local_uvar_14 = local_uvar_7;
          if (local_uvar_5 == 2) {
            local_uvar_14 = (local_uvar_7 & 0xfffe) >> 1;
          }
        }
        local_uvar_5 = 0;
        local_var_2 = input[1];
        local_uvar_11 = *input;
        do {
          if ((local_uvar_14 & 0xffff) <= (local_uvar_5 & 0xffff)) {
            local_var_13 = sub_0x150d8(local_uvar_11,local_var_2,local_uvar_6,local_10,param_4);
            is_valid_1 = 1;
            if ((local_var_13 != 0) ||
               (local_var_13 = (**(code **)(local_var_2 + 0x18))(local_uvar_11,local_uvar_3,local_uvar_10,*(code **)(local_var_2 + 0x18)),
               local_var_13 != 0)) goto LAB_ram_000150c0;
            local_uvar_5 = 0;
            local_uvar_10 = local_uvar_7 - local_uvar_14 & 0xffff;
            goto LAB_ram_00015000;
          }
          local_var_13 = (**(code **)(local_var_2 + 0x20))(local_uvar_11,local_uvar_12 & 0x1fffff,*(code **)(local_var_2 + 0x20));
          local_uvar_5 = local_uvar_5 + 1;
        } while (local_var_13 == 0);
        is_valid_1 = 1;
      }
      else {
        local_uvar_8 = input[2];
        *(uint *)(input + 2) = (uint)local_uvar_8 & 0x9fe00000 | 0x20000030;
        local_uvar_11 = *input;
        local_var_13 = input[1];
        local_var_2 = sub_0x150d8(local_uvar_11,local_var_13,local_uvar_6,local_10,param_4);
        is_valid_1 = 1;
        if (local_var_2 == 0) {
          local_uvar_12 = 0;
          do {
            if ((local_uvar_7 - local_uvar_5 & 0xffff) <= (local_uvar_12 & 0xffff)) {
              local_var_2 = (**(code **)(local_var_13 + 0x18))(local_uvar_11,local_uvar_3,local_uvar_10,*(code **)(local_var_13 + 0x18));
              if (local_var_2 == 0) {
                input[2] = local_uvar_8;
                is_valid_1 = 0;
              }
              break;
            }
            local_var_2 = (**(code **)(local_var_13 + 0x20))(local_uvar_11,0x30,*(code **)(local_var_13 + 0x20));
            local_uvar_12 = local_uvar_12 + 1;
          } while (local_var_2 == 0);
        }
      }
      goto LAB_ram_000150c0;
    }
  }
  else {
    if (param_4 < 0x20) {
      local_var_2 = 0;
      pcVar4 = param_3;
      for (local_uvar_7 = param_4; local_uvar_7 != 0; local_uvar_7 = local_uvar_7 - 1) {
        local_var_2 = local_var_2 + (uint64_t)(-0x41 < *pcVar4);
        pcVar4 = pcVar4 + 1;
      }
    }
    else {
      local_var_2 = sub_0x165a8(param_3,param_4);
    }
    local_uvar_5 = local_var_2 + local_uvar_5;
    local_uvar_7 = (uint64_t)*(ushort *)((int64_t)input + 0x14);
    local_10 = param_3;
    if (local_uvar_5 < local_uvar_7) goto LAB_ram_00014d28;
  }
  local_var_13 = input[1];
  local_uvar_11 = *input;
  local_var_2 = sub_0x150d8(local_uvar_11,local_var_13,local_uvar_6,local_10,param_4);
  is_valid_1 = 1;
  if (local_var_2 == 0) {
    pcVar9 = *(code **)(local_var_13 + 0x18);
    is_valid_1 = (*pcVar9)(local_uvar_11,local_uvar_3,local_uvar_10,pcVar9);
  }
LAB_ram_000150c0:
  return is_valid_1 & 1;
  while( true ) {
    local_var_13 = (**(code **)(local_var_2 + 0x20))(local_uvar_11,local_uvar_12 & 0x1fffff,*(code **)(local_var_2 + 0x20));
    local_uvar_5 = local_uvar_5 + 1;
    if (local_var_13 != 0) break;
LAB_ram_00015000:
    is_valid_1 = (local_uvar_5 & 0xffff) < local_uvar_10;
    if (local_uvar_10 <= (local_uvar_5 & 0xffff)) break;
  }
  goto LAB_ram_000150c0;
}



/* Function: sub_0x150d8 @ 0x150d8 */

uint64_t
sub_0x150d8(uint64_t input,int64_t param_2,uint64_t param_3,int64_t param_4,
                uint64_t param_5)

{
  int64_t local_var_1;
  uint64_t local_uvar_2;
  
  if (((param_3 & 0xffffffff) != 0x110000) &&
     (local_var_1 = (**(code **)(param_2 + 0x20))(input,param_3,param_3,*(code **)(param_2 + 0x20)),
     local_var_1 != 0)) {
    return 1;
  }
  if (param_4 == 0) {
    local_uvar_2 = 0;
  }
  else {
    local_uvar_2 = (**(code **)(param_2 + 0x18))(input,param_4,param_5,*(code **)(param_2 + 0x18));
  }
  return local_uvar_2;
}



/* Function: sub_0x15190 @ 0x15190 */

byte sub_0x15190(uint64_t *input,byte *param_2,byte *param_3)

{
  uint local_uvar_1;
  ushort local_uvar_2;
  byte is_valid_3;
  uint64_t local_uvar_4;
  int64_t local_var_5;
  uint local_uvar_6;
  byte *pis_valid_7;
  byte *pis_valid_8;
  uint64_t local_uvar_9;
  byte *pis_valid_10;
  int64_t local_var_11;
  uint64_t local_uvar_12;
  uint64_t local_uvar_13;
  uint64_t local_10;
  
  local_uvar_1 = *(uint *)(input + 2);
  if ((local_uvar_1 & 0x18000000) != 0) {
    if ((local_uvar_1 & 0x10000000) != 0) {
      local_uvar_4 = (uint64_t)*(ushort *)((int64_t)input + 0x16);
      if (local_uvar_4 == 0) {
        local_uvar_2 = *(ushort *)((int64_t)input + 0x14);
joined_r0x00015628:
        local_uvar_9 = (uint64_t)local_uvar_2;
        local_uvar_4 = 0;
        param_3 = (byte *)0x0;
        if (local_uvar_9 == 0) goto LAB_ram_00015630;
      }
      else {
        pis_valid_8 = param_2 + (int64_t)param_3;
        param_3 = (byte *)0x0;
        local_uvar_9 = local_uvar_4;
        pis_valid_7 = param_2;
        do {
          if (pis_valid_7 == pis_valid_8) {
            if (local_uvar_9 == 0) {
              local_uvar_9 = 0;
            }
            goto LAB_ram_00015400;
          }
          pis_valid_10 = pis_valid_7 + 1;
          is_valid_3 = *pis_valid_7;
          if ((((char)is_valid_3 < '\0') && (pis_valid_10 = pis_valid_7 + 2, 0xdf < is_valid_3)) &&
             (pis_valid_10 = pis_valid_7 + 3, 0xef < is_valid_3)) {
            pis_valid_10 = pis_valid_7 + 4;
          }
          param_3 = pis_valid_10 + ((int64_t)param_3 - (int64_t)pis_valid_7);
          local_uvar_9 = local_uvar_9 - 1;
          pis_valid_7 = pis_valid_10;
        } while (local_uvar_9 != 0);
        local_uvar_9 = 0;
LAB_ram_00015400:
        local_uvar_4 = local_uvar_4 - local_uvar_9;
LAB_ram_00015410:
        local_uvar_9 = (uint64_t)*(ushort *)((int64_t)input + 0x14);
        if (local_uvar_9 <= local_uvar_4) goto LAB_ram_00015630;
      }
LAB_ram_00015420:
      local_uvar_9 = local_uvar_9 - local_uvar_4;
      local_10 = 0;
      local_uvar_6 = local_uvar_1 >> 0x1d & 3;
      if (local_uvar_6 < 2) {
        if ((local_uvar_1 >> 0x1d & 3) != 0) {
          local_10 = local_uvar_9;
        }
      }
      else if (local_uvar_6 == 2) {
        local_10 = (local_uvar_9 & 0xfffe) >> 1;
      }
      local_uvar_4 = 0;
      local_var_11 = input[1];
      local_uvar_13 = *input;
      do {
        if ((local_10 & 0xffff) <= (local_uvar_4 & 0xffff)) {
          local_var_5 = (**(code **)(local_var_11 + 0x18))(local_uvar_13,param_2,param_3,*(code **)(local_var_11 + 0x18));
          is_valid_3 = 1;
          if (local_var_5 != 0) goto LAB_ram_00015670;
          local_uvar_12 = 0;
          local_uvar_4 = local_uvar_9 - local_10 & 0xffff;
          goto LAB_ram_000155a0;
        }
        local_var_5 = (**(code **)(local_var_11 + 0x20))(local_uvar_13,local_uvar_1 & 0x1fffff,*(code **)(local_var_11 + 0x20));
        local_uvar_4 = local_uvar_4 + 1;
      } while (local_var_5 == 0);
      is_valid_3 = 1;
      goto LAB_ram_00015670;
    }
    if (param_3 < (byte *)0x20) {
      if (param_3 == (byte *)0x0) {
        local_uvar_2 = *(ushort *)((int64_t)input + 0x14);
        goto joined_r0x00015628;
      }
      local_uvar_4 = 0;
      pis_valid_7 = (byte *)0x0;
      do {
        local_uvar_4 = local_uvar_4 + (-0x41 < (char)param_2[(int64_t)pis_valid_7]);
        pis_valid_7 = pis_valid_7 + 1;
      } while (param_3 != pis_valid_7);
      goto LAB_ram_00015410;
    }
    local_uvar_4 = sub_0x165a8(param_2,param_3);
    local_uvar_9 = (uint64_t)*(ushort *)((int64_t)input + 0x14);
    if (local_uvar_4 < local_uvar_9) goto LAB_ram_00015420;
  }
LAB_ram_00015630:
  is_valid_3 = (**(code **)(input[1] + 0x18))(*input,param_2,param_3,*(code **)(input[1] + 0x18));
LAB_ram_00015670:
  return is_valid_3 & 1;
  while( true ) {
    local_var_5 = (**(code **)(local_var_11 + 0x20))(local_uvar_13,local_uvar_1 & 0x1fffff,*(code **)(local_var_11 + 0x20));
    local_uvar_12 = local_uvar_12 + 1;
    if (local_var_5 != 0) break;
LAB_ram_000155a0:
    is_valid_3 = (local_uvar_12 & 0xffff) < local_uvar_4;
    if (local_uvar_4 <= (local_uvar_12 & 0xffff)) break;
  }
  goto LAB_ram_00015670;
}



/* Function: sub_0x15688 @ 0x15688 */

void sub_0x15688(uint64_t *input)

{
  (**(code **)(input[1] + 0x18))(*input);
  return;
}



/* Function: sub_0x15938 @ 0x15938 */

uint64_t
sub_0x15938(uint64_t *input,uint64_t param_2,int64_t param_3,uint64_t param_4,
                int64_t param_5)

{
  int64_t local_var_1;
  code *pcVar2;
  int64_t local_var_3;
  uint64_t local_uvar_4;
  uint64_t local_38;
  int64_t local_30;
  uint8_t *local_28;
  uint8_t local_19;
  uint64_t *local_18;
  uint8_t *local_10;
  uint64_t local_8;
  
  local_uvar_4 = *input;
  local_var_3 = input[1];
  pcVar2 = *(code **)(local_var_3 + 0x18);
  local_var_1 = (*pcVar2)(local_uvar_4);
  if (local_var_1 != 0) {
    return 1;
  }
  if ((*(uint *)(input + 2) & 0x800000) == 0) {
    local_var_1 = (*pcVar2)(local_uvar_4,
                      "((\n,0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
                      ,1);
    if (local_var_1 == 0) {
      local_var_1 = (**(code **)(param_5 + 0x18))(param_4,input,*(code **)(param_5 + 0x18));
joined_r0x00015b40:
      if (local_var_1 != 0) {
        return 1;
      }
      if (((param_3 == 0) && ((*(uint *)(input + 2) & 0x800000) == 0)) &&
         (local_var_1 = (**(code **)(input[1] + 0x18))
                            (*input,
                             ",0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
                             ,1,*(code **)(input[1] + 0x18)), local_var_1 != 0)) {
        return 1;
      }
      local_uvar_4 = (**(code **)(input[1] + 0x18))
                        (*input,
                         ")..called `Option::unwrap()` on a `None` value but the index is :  { ,  {\n,\n} }((\n,0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
                         ,1,*(code **)(input[1] + 0x18));
      return local_uvar_4;
    }
  }
  else {
    local_var_1 = (*pcVar2)(local_uvar_4,
                      "(\n,0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
                      ,2);
    if (local_var_1 == 0) {
      local_28 = &local_19;
      local_19 = 1;
      local_8 = input[2];
      local_10 = &DAT_ram_0001e650;
      local_18 = &local_38;
      local_38 = local_uvar_4;
      local_30 = local_var_3;
      local_var_1 = (**(code **)(param_5 + 0x18))(param_4,&local_18,*(code **)(param_5 + 0x18));
      if (local_var_1 == 0) {
        local_var_1 = (**(code **)(local_10 + 0x18))
                          (local_18,
                           ",\n} }((\n,0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
                           ,2,*(code **)(local_10 + 0x18));
        goto joined_r0x00015b40;
      }
    }
  }
  return 1;
}



/* Function: sub_0x16428 @ 0x16428 */

void sub_0x16428(uint64_t input,uint64_t param_2,uint64_t param_3)

{
  sub_0x15190(param_3,input,param_2);
  return;
}



/* Function: sub_0x16590 @ 0x16590 */

int64_t sub_0x16590(char *input,uint64_t param_2)

{
  bool is_valid_1;
  int64_t local_var_2;
  uint64_t local_uvar_3;
  uint64_t *plocal_uvar_4;
  uint64_t local_uvar_5;
  int64_t local_var_6;
  uint64_t local_uvar_7;
  int64_t local_var_8;
  uint64_t *plocal_uvar_9;
  char *pcVar10;
  
  sub_0x18d08();
  sub_0x18dd0();
  sub_0x18e98();
  pcVar10 = (char *)((uint64_t)(input + 7) & 0xfffffffffffffff8);
  local_uvar_5 = (int64_t)pcVar10 - (int64_t)input;
  if ((param_2 < local_uvar_5) || (local_uvar_7 = param_2 - local_uvar_5, local_uvar_7 < 8)) {
    local_var_2 = 0;
    for (; param_2 != 0; param_2 = param_2 - 1) {
      local_var_2 = local_var_2 + (uint64_t)(-0x41 < *input);
      input = input + 1;
    }
  }
  else {
    local_uvar_3 = local_uvar_7 & 7;
    local_var_2 = 0;
    local_var_6 = 0;
    if (pcVar10 != input) {
      local_var_8 = (int64_t)input - (int64_t)pcVar10;
      pcVar10 = input;
      do {
        is_valid_1 = local_var_8 != -1;
        local_var_8 = local_var_8 + 1;
        local_var_6 = local_var_6 + (uint64_t)(-0x41 < *pcVar10);
        pcVar10 = pcVar10 + 1;
      } while (is_valid_1);
    }
    if (local_uvar_3 != 0) {
      pcVar10 = (char *)((int64_t)(input + local_uvar_5) + (local_uvar_7 & 0xfffffffffffffff8));
      local_var_2 = 0;
      do {
        local_var_2 = local_var_2 + (uint64_t)(-0x41 < *pcVar10);
        pcVar10 = pcVar10 + 1;
        local_uvar_3 = local_uvar_3 - 1;
      } while (local_uvar_3 != 0);
    }
    local_var_2 = local_var_2 + local_var_6;
    plocal_uvar_4 = (uint64_t *)(input + local_uvar_5);
    local_uvar_5 = local_uvar_7 >> 3;
    do {
      local_uvar_7 = local_uvar_5;
      plocal_uvar_9 = plocal_uvar_4;
      if (local_uvar_7 == 0) {
        return local_var_2;
      }
      local_uvar_3 = local_uvar_7;
      if (0xbf < local_uvar_7) {
        local_uvar_3 = 0xc0;
      }
      local_uvar_5 = 0;
      if (3 < local_uvar_7) {
        plocal_uvar_4 = plocal_uvar_9;
        do {
          local_uvar_5 = (((plocal_uvar_4[3] ^ 0xffffffffffffffff) >> 7 | plocal_uvar_4[3] >> 6) & 0x101010101010101) +
                  (((plocal_uvar_4[2] ^ 0xffffffffffffffff) >> 7 | plocal_uvar_4[2] >> 6) & 0x101010101010101) +
                  (((plocal_uvar_4[1] ^ 0xffffffffffffffff) >> 7 | plocal_uvar_4[1] >> 6) & 0x101010101010101) +
                  (((*plocal_uvar_4 ^ 0xffffffffffffffff) >> 7 | *plocal_uvar_4 >> 6) & 0x101010101010101) + local_uvar_5
          ;
          plocal_uvar_4 = plocal_uvar_4 + 4;
        } while (plocal_uvar_4 != (uint64_t *)((int64_t)plocal_uvar_9 + (local_uvar_3 * 8 & 0x7e0)));
      }
      local_var_2 = (((local_uvar_5 >> 8 & 0xff00ff00ff00ff) + (local_uvar_5 & 0xff00ff00ff00ff)) * 0x1000100010001 >>
              0x30) + local_var_2;
      plocal_uvar_4 = plocal_uvar_9 + local_uvar_3;
      local_uvar_5 = local_uvar_7 - local_uvar_3;
    } while ((local_uvar_3 & 3) == 0);
    if (0xbf < local_uvar_7) {
      local_uvar_7 = 0;
    }
    plocal_uvar_9 = plocal_uvar_9 + (local_uvar_3 & 0xfc);
    local_uvar_5 = 0;
    local_var_6 = (local_uvar_7 & 3) << 3;
    do {
      local_uvar_5 = (((*plocal_uvar_9 ^ 0xffffffffffffffff) >> 7 | *plocal_uvar_9 >> 6) & 0x101010101010101) + local_uvar_5;
      plocal_uvar_9 = plocal_uvar_9 + 1;
      local_var_6 = local_var_6 + -8;
    } while (local_var_6 != 0);
    local_var_2 = (((local_uvar_5 >> 8 & 0xff00ff00ff00ff) + (local_uvar_5 & 0xff00ff00ff00ff)) * 0x1000100010001 >>
            0x30) + local_var_2;
  }
  return local_var_2;
}



/* Function: sub_0x165a8 @ 0x165a8 */

int64_t sub_0x165a8(char *input,uint64_t param_2)

{
  bool is_valid_1;
  int64_t local_var_2;
  uint64_t local_uvar_3;
  uint64_t *plocal_uvar_4;
  uint64_t local_uvar_5;
  int64_t local_var_6;
  uint64_t local_uvar_7;
  int64_t local_var_8;
  uint64_t *plocal_uvar_9;
  char *pcVar10;
  
  pcVar10 = (char *)((uint64_t)(input + 7) & 0xfffffffffffffff8);
  local_uvar_5 = (int64_t)pcVar10 - (int64_t)input;
  if ((param_2 < local_uvar_5) || (local_uvar_7 = param_2 - local_uvar_5, local_uvar_7 < 8)) {
    local_var_2 = 0;
    for (; param_2 != 0; param_2 = param_2 - 1) {
      local_var_2 = local_var_2 + (uint64_t)(-0x41 < *input);
      input = input + 1;
    }
  }
  else {
    local_uvar_3 = local_uvar_7 & 7;
    local_var_2 = 0;
    local_var_6 = 0;
    if (pcVar10 != input) {
      local_var_8 = (int64_t)input - (int64_t)pcVar10;
      pcVar10 = input;
      do {
        is_valid_1 = local_var_8 != -1;
        local_var_8 = local_var_8 + 1;
        local_var_6 = local_var_6 + (uint64_t)(-0x41 < *pcVar10);
        pcVar10 = pcVar10 + 1;
      } while (is_valid_1);
    }
    if (local_uvar_3 != 0) {
      pcVar10 = (char *)((int64_t)(input + local_uvar_5) + (local_uvar_7 & 0xfffffffffffffff8));
      local_var_2 = 0;
      do {
        local_var_2 = local_var_2 + (uint64_t)(-0x41 < *pcVar10);
        pcVar10 = pcVar10 + 1;
        local_uvar_3 = local_uvar_3 - 1;
      } while (local_uvar_3 != 0);
    }
    local_var_2 = local_var_2 + local_var_6;
    plocal_uvar_4 = (uint64_t *)(input + local_uvar_5);
    local_uvar_5 = local_uvar_7 >> 3;
    do {
      local_uvar_7 = local_uvar_5;
      plocal_uvar_9 = plocal_uvar_4;
      if (local_uvar_7 == 0) {
        return local_var_2;
      }
      local_uvar_3 = local_uvar_7;
      if (0xbf < local_uvar_7) {
        local_uvar_3 = 0xc0;
      }
      local_uvar_5 = 0;
      if (3 < local_uvar_7) {
        plocal_uvar_4 = plocal_uvar_9;
        do {
          local_uvar_5 = (((plocal_uvar_4[3] ^ 0xffffffffffffffff) >> 7 | plocal_uvar_4[3] >> 6) & 0x101010101010101) +
                  (((plocal_uvar_4[2] ^ 0xffffffffffffffff) >> 7 | plocal_uvar_4[2] >> 6) & 0x101010101010101) +
                  (((plocal_uvar_4[1] ^ 0xffffffffffffffff) >> 7 | plocal_uvar_4[1] >> 6) & 0x101010101010101) +
                  (((*plocal_uvar_4 ^ 0xffffffffffffffff) >> 7 | *plocal_uvar_4 >> 6) & 0x101010101010101) + local_uvar_5
          ;
          plocal_uvar_4 = plocal_uvar_4 + 4;
        } while (plocal_uvar_4 != (uint64_t *)((int64_t)plocal_uvar_9 + (local_uvar_3 * 8 & 0x7e0)));
      }
      local_var_2 = (((local_uvar_5 >> 8 & 0xff00ff00ff00ff) + (local_uvar_5 & 0xff00ff00ff00ff)) * 0x1000100010001 >>
              0x30) + local_var_2;
      plocal_uvar_4 = plocal_uvar_9 + local_uvar_3;
      local_uvar_5 = local_uvar_7 - local_uvar_3;
    } while ((local_uvar_3 & 3) == 0);
    if (0xbf < local_uvar_7) {
      local_uvar_7 = 0;
    }
    plocal_uvar_9 = plocal_uvar_9 + (local_uvar_3 & 0xfc);
    local_uvar_5 = 0;
    local_var_6 = (local_uvar_7 & 3) << 3;
    do {
      local_uvar_5 = (((*plocal_uvar_9 ^ 0xffffffffffffffff) >> 7 | *plocal_uvar_9 >> 6) & 0x101010101010101) + local_uvar_5;
      plocal_uvar_9 = plocal_uvar_9 + 1;
      local_var_6 = local_var_6 + -8;
    } while (local_var_6 != 0);
    local_var_2 = (((local_uvar_5 >> 8 & 0xff00ff00ff00ff) + (local_uvar_5 & 0xff00ff00ff00ff)) * 0x1000100010001 >>
            0x30) + local_var_2;
  }
  return local_var_2;
}



/* Function: sub_0x178f0 @ 0x178f0 */

void sub_0x178f0(uint64_t input)

{
  uint8_t *local_30;
  uint64_t local_28;
  uint64_t local_20;
  uint64_t local_18;
  uint64_t local_10;
  
  local_30 = &DAT_ram_0001e5f0;
  local_10 = 0;
  local_28 = 1;
  local_18 = 0;
  local_20 = 8;
                    /* WARNING: Subroutine does not return */
  sub_0x136d0(&local_30,input);
}



/* Function: sub_0x17948 @ 0x17948 */

void sub_0x17948(uint64_t input)

{
  uint8_t *local_30;
  uint64_t local_28;
  uint64_t local_20;
  uint64_t local_18;
  uint64_t local_10;
  
  local_30 = &DAT_ram_0001e600;
  local_10 = 0;
  local_28 = 1;
  local_18 = 0;
  local_20 = 8;
                    /* WARNING: Subroutine does not return */
  sub_0x136d0(&local_30,input);
}



/* Function: sub_0x17bf0 @ 0x17bf0 */

void sub_0x17bf0(uint *input,uint64_t param_2)

{
  bool is_valid_1;
  byte is_valid_2;
  uint64_t local_uvar_3;
  int64_t local_var_4;
  byte is_valid_5;
  byte abStack_3 [3];
  
  local_var_4 = 0;
  local_uvar_3 = (uint64_t)*input;
  do {
    is_valid_2 = (byte)(local_uvar_3 & 0xf);
    is_valid_5 = is_valid_2 | 0x30;
    if (9 < (local_uvar_3 & 0xf)) {
      is_valid_5 = is_valid_2 + 0x57;
    }
    abStack_3[local_var_4 + 2] = is_valid_5;
    local_var_4 = local_var_4 + -1;
    is_valid_1 = 0xf < local_uvar_3;
    local_uvar_3 = local_uvar_3 >> 4;
  } while (is_valid_1);
  sub_0x14ae0(param_2,1,
                   "0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
                   ,2);
  return;
}



/* Function: sub_0x18608 @ 0x18608 */

void sub_0x18608(int64_t *input,uint64_t param_2,int64_t param_3,int64_t param_4)

{
  uint64_t local_uvar_1;
  int64_t local_var_2;
  uint64_t local_uvar_3;
  int64_t local_var_4;
  char *pcVar5;
  uint64_t local_uvar_6;
  uint64_t local_uvar_7;
  
  local_var_2 = param_4;
  if ((param_2 & 0xffffffff) < 1000) {
    local_uvar_1 = param_2;
    local_uvar_7 = param_2 & 0xffffffff;
  }
  else {
    local_uvar_7 = param_2;
    do {
      local_uvar_6 = local_uvar_7 & 0xffffffff;
      local_uvar_1 = local_uvar_6 / 10000;
      local_uvar_7 = local_uvar_7 + local_uvar_1 * -10000;
      local_uvar_3 = (local_uvar_7 & 0xffff) / 100;
      local_uvar_7 = (local_uvar_7 + local_uvar_3 * -100) * 2 & 0xfffe;
      local_var_4 = local_uvar_3 * 2;
      pcVar5 = (char *)(param_3 + -2 + local_var_2);
      pcVar5[-1] = "attempt to add with overflowattempt to multiply with overflow)..called `Option::unwrap()` on a `None` value but the index is :  { ,  {\n,\n} }((\n,0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
                   [local_var_4 + 0x93];
      pcVar5[-2] = "attempt to add with overflowattempt to multiply with overflow)..called `Option::unwrap()` on a `None` value but the index is :  { ,  {\n,\n} }((\n,0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
                   [local_var_4 + 0x92];
      pcVar5[1] = "attempt to add with overflowattempt to multiply with overflow)..called `Option::unwrap()` on a `None` value but the index is :  { ,  {\n,\n} }((\n,0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
                  [local_uvar_7 + 0x93];
      *pcVar5 = "attempt to add with overflowattempt to multiply with overflow)..called `Option::unwrap()` on a `None` value but the index is :  { ,  {\n,\n} }((\n,0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
                [local_uvar_7 + 0x92];
      local_var_2 = local_var_2 + -4;
      local_uvar_7 = local_uvar_1;
    } while (9999999 < local_uvar_6);
  }
  if (9 < local_uvar_7) {
    local_uvar_7 = (local_uvar_1 & 0xffff) / 100;
    local_uvar_1 = (local_uvar_1 + local_uvar_7 * -100) * 2 & 0xfffe;
    *(char *)(param_3 + local_var_2 + -1) =
         "attempt to add with overflowattempt to multiply with overflow)..called `Option::unwrap()` on a `None` value but the index is :  { ,  {\n,\n} }((\n,0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
         [local_uvar_1 + 0x93];
    local_var_2 = local_var_2 + -2;
    *(char *)(param_3 + local_var_2) =
         "attempt to add with overflowattempt to multiply with overflow)..called `Option::unwrap()` on a `None` value but the index is :  { ,  {\n,\n} }((\n,0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
         [local_uvar_1 + 0x92];
    local_uvar_1 = local_uvar_7;
  }
  if (((param_2 & 0xffffffff) == 0) || ((local_uvar_1 & 0xffffffff) != 0)) {
    local_var_2 = local_var_2 + -1;
    *(char *)(param_3 + local_var_2) =
         "attempt to add with overflowattempt to multiply with overflow)..called `Option::unwrap()` on a `None` value but the index is :  { ,  {\n,\n} }((\n,0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
         [(local_uvar_1 & 0xf) * 2 + 0x93];
  }
  input[1] = param_4 - local_var_2;
  *input = param_3 + local_var_2;
  return;
}



/* Function: sub_0x189f8 @ 0x189f8 */

void sub_0x189f8(int64_t *input,uint64_t param_2,int64_t param_3,int64_t param_4)

{
  bool is_valid_1;
  uint64_t local_uvar_2;
  int64_t local_var_3;
  int64_t local_var_4;
  char *pcVar5;
  uint64_t local_uvar_6;
  int64_t local_var_7;
  
  local_uvar_2 = param_2;
  local_var_3 = param_4;
  if (999 < param_2) {
    local_uvar_6 = param_2;
    do {
      local_uvar_2 = local_uvar_6 / 10000;
      local_var_7 = ((local_uvar_6 % 10000) % 100) * 2;
      local_var_4 = ((local_uvar_6 % 10000) / 100) * 2;
      pcVar5 = (char *)(param_3 + -2 + local_var_3);
      pcVar5[-1] = "attempt to add with overflowattempt to multiply with overflow)..called `Option::unwrap()` on a `None` value but the index is :  { ,  {\n,\n} }((\n,0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
                   [local_var_4 + 0x93];
      pcVar5[-2] = "attempt to add with overflowattempt to multiply with overflow)..called `Option::unwrap()` on a `None` value but the index is :  { ,  {\n,\n} }((\n,0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
                   [local_var_4 + 0x92];
      pcVar5[1] = "attempt to add with overflowattempt to multiply with overflow)..called `Option::unwrap()` on a `None` value but the index is :  { ,  {\n,\n} }((\n,0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
                  [local_var_7 + 0x93];
      *pcVar5 = "attempt to add with overflowattempt to multiply with overflow)..called `Option::unwrap()` on a `None` value but the index is :  { ,  {\n,\n} }((\n,0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
                [local_var_7 + 0x92];
      local_var_3 = local_var_3 + -4;
      is_valid_1 = 9999999 < local_uvar_6;
      local_uvar_6 = local_uvar_2;
    } while (is_valid_1);
  }
  if (9 < local_uvar_2) {
    local_uvar_6 = (local_uvar_2 & 0xffff) / 100;
    local_uvar_2 = (local_uvar_2 + local_uvar_6 * -100) * 2 & 0xfffe;
    *(char *)(param_3 + local_var_3 + -1) =
         "attempt to add with overflowattempt to multiply with overflow)..called `Option::unwrap()` on a `None` value but the index is :  { ,  {\n,\n} }((\n,0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
         [local_uvar_2 + 0x93];
    local_var_3 = local_var_3 + -2;
    *(char *)(param_3 + local_var_3) =
         "attempt to add with overflowattempt to multiply with overflow)..called `Option::unwrap()` on a `None` value but the index is :  { ,  {\n,\n} }((\n,0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
         [local_uvar_2 + 0x92];
    local_uvar_2 = local_uvar_6;
  }
  if ((param_2 == 0) || (local_uvar_2 != 0)) {
    local_var_3 = local_var_3 + -1;
    *(char *)(param_3 + local_var_3) =
         "attempt to add with overflowattempt to multiply with overflow)..called `Option::unwrap()` on a `None` value but the index is :  { ,  {\n,\n} }((\n,0x00010203040506070809101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293949596979899[...]begin <= end (`byte index  is not a char boundary; it is inside ) of ` is out of bounds of `"
         [(local_uvar_2 & 0xf) * 2 + 0x93];
  }
  input[1] = param_4 - local_var_3;
  *input = param_3 + local_var_3;
  return;
}



/* Function: sub_0x18d08 @ 0x18d08 */

void sub_0x18d08(uint64_t input,uint64_t param_2,uint64_t param_3)

{
  uint64_t local_60;
  uint64_t local_58;
  uint8_t *local_50;
  uint64_t local_48;
  uint64_t **local_40;
  uint64_t local_38;
  uint64_t local_30;
  uint64_t *local_20;
  uint8_t *local_18;
  uint64_t *local_10;
  uint8_t *local_8;
  
  local_50 = &DAT_ram_0001e7b8;
  local_40 = &local_20;
  local_10 = &local_58;
  local_8 = &LAB_ram_00018960;
  local_18 = &LAB_ram_00018960;
  local_20 = &local_60;
  local_30 = 0;
  local_48 = 2;
  local_38 = 2;
  local_60 = input;
  local_58 = param_2;
                    /* WARNING: Subroutine does not return */
  sub_0x136d0(&local_50,param_3);
}



/* Function: sub_0x18dd0 @ 0x18dd0 */

void sub_0x18dd0(uint64_t input,uint64_t param_2,uint64_t param_3)

{
  uint64_t local_60;
  uint64_t local_58;
  uint8_t *local_50;
  uint64_t local_48;
  uint64_t **local_40;
  uint64_t local_38;
  uint64_t local_30;
  uint64_t *local_20;
  uint8_t *local_18;
  uint64_t *local_10;
  uint8_t *local_8;
  
  local_50 = &DAT_ram_0001e7d8;
  local_40 = &local_20;
  local_10 = &local_58;
  local_8 = &LAB_ram_00018960;
  local_18 = &LAB_ram_00018960;
  local_20 = &local_60;
  local_30 = 0;
  local_48 = 2;
  local_38 = 2;
  local_60 = input;
  local_58 = param_2;
                    /* WARNING: Subroutine does not return */
  sub_0x136d0(&local_50,param_3);
}



/* Function: sub_0x18e98 @ 0x18e98 */

void sub_0x18e98(uint64_t input,uint64_t param_2,uint64_t param_3)

{
  uint64_t local_60;
  uint64_t local_58;
  uint8_t *local_50;
  uint64_t local_48;
  uint64_t **local_40;
  uint64_t local_38;
  uint64_t local_30;
  uint64_t *local_20;
  uint8_t *local_18;
  uint64_t *local_10;
  uint8_t *local_8;
  
  local_50 = &DAT_ram_0001e7f8;
  local_40 = &local_20;
  local_10 = &local_58;
  local_8 = &LAB_ram_00018960;
  local_18 = &LAB_ram_00018960;
  local_20 = &local_60;
  local_30 = 0;
  local_48 = 2;
  local_38 = 2;
  local_60 = input;
  local_58 = param_2;
                    /* WARNING: Subroutine does not return */
  sub_0x136d0(&local_50,param_3);
}



/* Function: sub_0x193a8 @ 0x193a8 */

uint64_t sub_0x193a8(uint64_t input)

{
  sub_0x193b0();
  return input;
}



/* Function: sub_0x193b0 @ 0x193b0 */

void sub_0x193b0(void)

{
  sub_0x193b0();
  return;
}



/* Function: sub_0x193c8 @ 0x193c8 */

uint64_t sub_0x193c8(uint64_t input)

{
  sub_0x193d0();
  return input;
}



/* Function: sub_0x193d0 @ 0x193d0 */

void sub_0x193d0(void)

{
  sub_0x193d0();
  return;
}



/* Function: sub_0x193e8 @ 0x193e8 */

uint64_t sub_0x193e8(uint64_t input,uint8_t param_2)

{
  sub_0x193f8(input,param_2);
  return input;
}



/* Function: sub_0x193f8 @ 0x193f8 */

void sub_0x193f8(void)

{
  sub_0x193f8();
  return;
}



/* Function: sub_0x19410 @ 0x19410 */

int64_t sub_0x19410(uint64_t input)

{
  int64_t local_var_1;
  uint64_t local_uvar_2;
  
  if (input == 0) {
    local_var_1 = 0;
  }
  else {
    local_uvar_2 = input | input >> 1;
    local_uvar_2 = local_uvar_2 | local_uvar_2 >> 2;
    local_uvar_2 = local_uvar_2 | local_uvar_2 >> 4;
    local_uvar_2 = local_uvar_2 | local_uvar_2 >> 8;
    local_uvar_2 = local_uvar_2 | local_uvar_2 >> 0x10;
    local_uvar_2 = (local_uvar_2 | local_uvar_2 >> 0x20) ^ 0xffffffffffffffff;
    local_uvar_2 = local_uvar_2 - (local_uvar_2 >> 1 & 0x5555555555555555);
    local_uvar_2 = (local_uvar_2 & 0x3333333333333333) + (local_uvar_2 >> 2 & 0x3333333333333333);
    local_uvar_2 = (local_uvar_2 + (local_uvar_2 >> 4) & 0xf0f0f0f0f0f0f0f) * 0x101010101010101 >> 0x38;
    input = input << local_uvar_2;
    local_var_1 = (((input >> 0xb) - (local_uvar_2 << 0x34)) -
            ((int64_t)
             ((input << 0x35) - ((input & 0x7ff) >> 10 & (input >> 0xb ^ 0xffffffffffffffff)))
            >> 0x3f)) + 0x43d0000000000000;
  }
  return local_var_1;
}



/* Function: sub_0x19610 @ 0x19610 */

uint64_t sub_0x19610(uint64_t input,uint64_t param_2)

{
  int64_t local_var_1;
  
  local_var_1 = 3;
  if (((input & 0x7fffffffffffffff) < 0x7ff0000000000001) &&
     ((param_2 & 0x7fffffffffffffff) < 0x7ff0000000000001)) {
    if (((param_2 | input) & 0x7fffffffffffffff) == 0) {
      local_var_1 = 1;
    }
    else {
      if ((int64_t)(param_2 & input) < 0) {
        local_var_1 = 0;
        if ((int64_t)param_2 < (int64_t)input) goto LAB_ram_000196e0;
      }
      else {
        local_var_1 = 0;
        if ((int64_t)input < (int64_t)param_2) goto LAB_ram_000196e0;
      }
      local_var_1 = 1;
      if (input != param_2) {
        local_var_1 = 2;
      }
    }
  }
LAB_ram_000196e0:
  return (&DAT_ram_0001a7b0)[local_var_1];
}



/* Function: sub_0x19710 @ 0x19710 */

void sub_0x19710(void)

{
  sub_0x19720();
  return;
}



/* Function: sub_0x19720 @ 0x19720 */

uint64_t sub_0x19720(uint64_t input,uint64_t param_2)

{
  uint64_t local_uvar_1;
  uint64_t local_uvar_2;
  uint64_t local_uvar_3;
  uint64_t local_uvar_4;
  uint64_t local_uvar_5;
  uint64_t local_uvar_6;
  int64_t local_var_7;
  uint64_t local_uvar_8;
  uint64_t local_uvar_9;
  uint64_t local_10;
  uint64_t local_8;
  
  local_uvar_6 = (param_2 ^ input) & 0x8000000000000000;
  local_uvar_3 = param_2 & 0xfffffffffffff;
  local_uvar_4 = input & 0xfffffffffffff;
  local_uvar_8 = param_2 >> 0x34 & 0x7ff;
  local_uvar_9 = input >> 0x34 & 0x7ff;
  if ((local_uvar_9 - 0x7ff < 0xfffffffffffff802) || (local_uvar_8 - 0x7ff < 0xfffffffffffff802)) {
    local_uvar_5 = input & 0x7fffffffffffffff;
    if (0x7ff0000000000000 < local_uvar_5) {
      return input | 0x8000000000000;
    }
    local_uvar_2 = param_2 & 0x7fffffffffffffff;
    if (0x7ff0000000000000 < local_uvar_2) {
      return param_2 | 0x8000000000000;
    }
    local_uvar_1 = local_uvar_2;
    if ((local_uvar_5 == 0x7ff0000000000000) || (local_uvar_1 = local_uvar_5, local_uvar_2 == 0x7ff0000000000000)) {
      if (local_uvar_1 == 0) {
        return 0x7ff8000000000000;
      }
      goto LAB_ram_000199b8;
    }
    if (local_uvar_5 == 0) {
      return local_uvar_6;
    }
    if (local_uvar_2 == 0) {
      return local_uvar_6;
    }
    local_var_7 = 0;
    if (local_uvar_5 < 0x10000000000000) {
      if (local_uvar_4 == 0) {
        local_uvar_5 = 0x40;
      }
      else {
        local_uvar_5 = local_uvar_4 | local_uvar_4 >> 1;
        local_uvar_5 = local_uvar_5 | local_uvar_5 >> 2;
        local_uvar_5 = local_uvar_5 | local_uvar_5 >> 4;
        local_uvar_5 = local_uvar_5 | local_uvar_5 >> 8;
        local_uvar_5 = local_uvar_5 | local_uvar_5 >> 0x10;
        local_uvar_5 = (local_uvar_5 | local_uvar_5 >> 0x20) ^ 0xffffffffffffffff;
        local_uvar_5 = local_uvar_5 - (local_uvar_5 >> 1 & 0x5555555555555555);
        local_uvar_5 = (local_uvar_5 & 0x3333333333333333) + (local_uvar_5 >> 2 & 0x3333333333333333);
        local_uvar_5 = (local_uvar_5 + (local_uvar_5 >> 4) & 0xf0f0f0f0f0f0f0f) * 0x101010101010101 >> 0x38;
      }
      local_var_7 = 0xc - local_uvar_5;
      local_uvar_4 = local_uvar_4 << (local_uvar_5 + 0x35 & 0x3f);
    }
    if (local_uvar_2 < 0x10000000000000) {
      if (local_uvar_3 == 0) {
        local_uvar_5 = 0x40;
      }
      else {
        local_uvar_5 = local_uvar_3 | local_uvar_3 >> 1;
        local_uvar_5 = local_uvar_5 | local_uvar_5 >> 2;
        local_uvar_5 = local_uvar_5 | local_uvar_5 >> 4;
        local_uvar_5 = local_uvar_5 | local_uvar_5 >> 8;
        local_uvar_5 = local_uvar_5 | local_uvar_5 >> 0x10;
        local_uvar_5 = (local_uvar_5 | local_uvar_5 >> 0x20) ^ 0xffffffffffffffff;
        local_uvar_5 = local_uvar_5 - (local_uvar_5 >> 1 & 0x5555555555555555);
        local_uvar_5 = (local_uvar_5 & 0x3333333333333333) + (local_uvar_5 >> 2 & 0x3333333333333333);
        local_uvar_5 = (local_uvar_5 + (local_uvar_5 >> 4) & 0xf0f0f0f0f0f0f0f) * 0x101010101010101 >> 0x38;
      }
      local_uvar_3 = local_uvar_3 << (local_uvar_5 + 0x35 & 0x3f);
      local_var_7 = (local_var_7 - local_uvar_5) + 0xc;
    }
  }
  else {
    local_var_7 = 0;
  }
  sub_0x19f78(&local_10,local_uvar_3 << 0xb | 0x8000000000000000,0,local_uvar_4 | 0x10000000000000,0);
  local_var_7 = local_uvar_8 + local_uvar_9 + local_var_7;
  if ((local_8 & 0x10000000000000) == 0) {
    local_8 = local_8 << 1 | local_10 >> 0x3f;
    local_10 = local_10 << 1;
    local_var_7 = local_var_7 + -0x3ff;
  }
  else {
    local_var_7 = local_var_7 + -0x3fe;
  }
  if (local_var_7 < 0x7ff) {
    if (local_var_7 < 1) {
      local_uvar_3 = 1 - local_var_7;
      if (0x3f < local_uvar_3) {
        return local_uvar_6;
      }
      local_uvar_4 = local_var_7 + 0x3fU & 0xffffffff;
      local_10 = local_10 >> local_uvar_3 | local_8 << local_uvar_4 | (uint64_t)(local_10 << local_uvar_4 != 0);
      local_8 = local_8 >> local_uvar_3;
    }
    else {
      local_8 = local_var_7 << 0x34 | local_8 & 0xfffffffffffff;
    }
    local_uvar_6 = local_8 | local_uvar_6;
    if (0x8000000000000000 < local_10) {
      return local_uvar_6 + 1;
    }
    if (local_10 != 0x8000000000000000) {
      return local_uvar_6;
    }
    return local_uvar_6 + (local_8 & 1);
  }
LAB_ram_000199b8:
  return local_uvar_6 | 0x7ff0000000000000;
}



/* Function: sub_0x19ec0 @ 0x19ec0 */

uint64_t sub_0x19ec0(uint64_t input)

{
  uint64_t local_uvar_1;
  
  local_uvar_1 = 0;
  if (0x3fefffffffffffff < input) {
    if (input < 0x43f0000000000000) {
      local_uvar_1 = (input << 0xb | 0x8000000000000000) >> (0x3e - (input >> 0x34) & 0x3f);
    }
    else if (input < 0x7ff0000000000001) {
      local_uvar_1 = 0xffffffffffffffff;
    }
  }
  return local_uvar_1;
}



/* Function: sub_0x19f78 @ 0x19f78 */

void sub_0x19f78(uint64_t *input,uint64_t param_2,int64_t param_3,uint64_t param_4,
                     int64_t param_5)

{
  uint64_t local_uvar_1;
  uint64_t local_uvar_2;
  uint64_t local_uvar_3;
  uint64_t local_uvar_4;
  
  local_uvar_2 = (param_4 & 0xffffffff) * (param_2 & 0xffffffff);
  local_uvar_4 = (param_4 >> 0x20) * (param_2 & 0xffffffff);
  local_uvar_1 = local_uvar_4 + (param_4 & 0xffffffff) * (param_2 >> 0x20);
  local_uvar_3 = local_uvar_2 + (local_uvar_1 << 0x20);
  *input = local_uvar_3;
  input[1] = (param_4 >> 0x20) * (param_2 >> 0x20) + param_5 * param_2 + param_4 * param_3 +
               ((uint64_t)(local_uvar_1 < local_uvar_4) << 0x20 | local_uvar_1 >> 0x20) + (uint64_t)(local_uvar_3 < local_uvar_2);
  return;
}



/* Function: sub_0x1a0d8 @ 0x1a0d8 */

uint64_t sub_0x1a0d8(uint64_t input,uint64_t param_2)

{
  int64_t local_var_1;
  
  local_var_1 = 3;
  if (((input & 0x7fffffffffffffff) < 0x7ff0000000000001) &&
     ((param_2 & 0x7fffffffffffffff) < 0x7ff0000000000001)) {
    if (((param_2 | input) & 0x7fffffffffffffff) == 0) {
      local_var_1 = 1;
    }
    else {
      if ((int64_t)(param_2 & input) < 0) {
        local_var_1 = 0;
        if ((int64_t)param_2 < (int64_t)input) goto LAB_ram_0001a1a8;
      }
      else {
        local_var_1 = 0;
        if ((int64_t)input < (int64_t)param_2) goto LAB_ram_0001a1a8;
      }
      local_var_1 = 1;
      if (input != param_2) {
        local_var_1 = 2;
      }
    }
  }
LAB_ram_0001a1a8:
  return (&DAT_ram_0001a7b0)[local_var_1];
}



/* Function: abort @ 0x22000 */

/* WARNING: Control flow encountered bad instruction data */
/* WARNING: Unknown calling convention -- yet parameter storage is locked */

void abort(void)

{
                    /* WARNING: Bad instruction - Truncating control flow here */
  halt_baddata();
}



